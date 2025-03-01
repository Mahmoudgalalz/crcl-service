import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  Event,
  EventStatus,
  PaymentStatus,
  RequestStatus,
  Ticket,
  TicketStatus,
} from '@prisma/client';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { newId } from 'src/common/uniqueId.utils';
import { CreateTicketDto, UpdateTicketDto } from './dto/tickets.dto';
import { getFuse } from 'src/shared/auth/shared/fues';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TicketApprovalEmailProps } from '../email/types/email.type';
import { RequestApprovedEvent } from '../email/events/sendOtp.event';
import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import { Response } from 'express';
import { GlobalNotificationEvent } from './events/global-notification.event';

interface RequestMetaItem {
  name: string;
  email: string;
  number: string;
  social: string;
  ticketId: string;
}

@Injectable()
export class EventsManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createEvent(data: CreateEventDto): Promise<Event> {
    const id = newId('event', 16);
    return await this.prisma.event.create({
      data: {
        id,
        ...data,
      },
    });
  }

  async updateEvent(id: string, data: UpdateEventDto): Promise<Event> {
    if (data.status === EventStatus.PUBLISHED) {
      this.eventEmitter.emit(
        'notification.send',
        new GlobalNotificationEvent({
          topic: 'global',
          payload: {
            title: 'Get early-bird tickets for our new event',
            body: `A new event ${data.title} has been published`,
          },
        }),
      );
    }
    return await this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async listAllEvents(
    page: number,
    limit: number,
  ): Promise<{ events: Event[]; total: number }> {
    const [events, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.event.count(),
    ]);
    return { events, total };
  }

  async getEventWithTickets(id: string): Promise<{ event: Event }> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        tickets: {
          where: {
            deletedAt: {
              equals: null,
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return { event };
  }

  async searchEvents(
    search: string,
  ): Promise<{ events: Event[]; total: number }> {
    const [events, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where: {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
      }),
      this.prisma.event.count({
        where: {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
      }),
    ]);
    return { events, total };
  }

  async createTicket(eventId: string, data: CreateTicketDto): Promise<Ticket> {
    const id = newId('ticket', 16);
    return await this.prisma.ticket.create({
      data: {
        id,
        ...data,
        event: {
          connect: {
            id: eventId,
          },
        },
      },
    });
  }

  async updateTicket(id: string, data: UpdateTicketDto): Promise<Ticket> {
    return await this.prisma.ticket.update({
      where: { id },
      data,
    });
  }

  async deleteTicket(id: string) {
    try {
      return await this.prisma.ticket.update({
        where: { id },
        data: {
          deletedAt: Date.now().toString(),
        },
      });
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Ticket not found');
    }
  }

  async getEventRequestDetails(
    eventId: string,
    page: number = 1,
    pageSize: number = 10,
  ) {
    try {
      // Validate inputs
      if (!eventId) {
        throw new Error('Event ID is required');
      }

      // Ensure positive numbers for pagination
      page = Math.max(1, page);
      pageSize = Math.max(1, pageSize);
      const skip = (page - 1) * pageSize;

      const requests = await this.prisma.eventRequest.findMany({
        where: {
          eventId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              number: true,
              picture: true,
              tickets: {
                where: {
                  ticket: {
                    eventId: eventId,
                  },
                },
                select: {
                  id: true,
                  status: true,
                  payment: true,
                  paymentReference: true,
                  ticket: {
                    select: {
                      id: true,
                      title: true,
                      price: true,
                    },
                  },
                  createdAt: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      });

      // Transform the data with proper meta handling
      const transformedRequests = requests
        .map((request) => {
          let ticketsWithStatus: Array<{
            ticketId: string;
            requestInfo: {
              name: string;
              email: string;
              number: string;
              social: string;
            };
            ticketInfo: {
              title: string | undefined;
              price: number | undefined;
            };
            purchaseStatus: {
              status: TicketStatus;
              payment: PaymentStatus;
              purchaseId: string;
              paymentReference?: string;
              purchasedAt: Date;
            } | null;
          }> = [];

          try {
            const metaItems = request.meta as unknown as RequestMetaItem[];

            if (Array.isArray(metaItems)) {
              ticketsWithStatus = metaItems.map((metaItem) => {
                const purchaseRecord = request.user?.tickets?.find(
                  (t) => t.ticket?.id === metaItem.ticketId,
                );

                // Find the corresponding ticket info
                const ticketInfo = request.user?.tickets?.find(
                  (t) => t.ticket?.id === metaItem.ticketId,
                )?.ticket;

                return {
                  ticketId: metaItem.ticketId,
                  requestInfo: {
                    name: metaItem.name,
                    email: metaItem.email,
                    number: metaItem.number,
                    social: metaItem.social,
                  },
                  ticketInfo: {
                    title: ticketInfo?.title,
                    price: ticketInfo?.price,
                  },
                  purchaseStatus:
                    request.status === RequestStatus.APPROVED
                      ? {
                          status:
                            purchaseRecord?.status || TicketStatus.UPCOMMING,
                          payment:
                            purchaseRecord?.payment || PaymentStatus.PENDING,
                          purchaseId: purchaseRecord?.id || '',
                          paymentReference: purchaseRecord?.paymentReference,
                          purchasedAt: purchaseRecord?.createdAt || new Date(),
                        }
                      : null,
                };
              });
            } else {
              console.warn(
                `Invalid meta structure for request ${request.id}:`,
                request.meta,
              );
            }
          } catch (error) {
            console.error(
              `Error processing request ${request.id} meta data:`,
              error,
            );
            console.log('Meta content:', request.meta);
          }

          return {
            id: request.id,
            status: request.status,
            createdAt: request.createdAt,
            user: request.user
              ? {
                  id: request.user.id,
                  name: request.user.name || 'Unknown User',
                  email: request.user.email,
                  number: request.user.number,
                  picture: request.user.picture,
                }
              : null,
            tickets: ticketsWithStatus,
          };
        })
        .filter((request) => request.user !== null);

      const totalRequests = await this.prisma.eventRequest.count({
        where: {
          eventId,
        },
      });

      // Handle case where there are no results
      if (totalRequests === 0) {
        return {
          data: [],
          meta: {
            total: 0,
            page,
            pageSize,
            totalPages: 0,
          },
        };
      }

      const invitations = await this.prisma.invitation.count({
        where: {
          eventId: eventId,
          type: {
            not: 'paid',
          },
        },
      });

      return {
        data: transformedRequests,
        invitations,
        meta: {
          total: totalRequests,
          page,
          pageSize,
          totalPages: Math.ceil(totalRequests / pageSize),
        },
      };
    } catch (error) {
      console.error('Error in getEventRequestDetails:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
        });
      }
      throw new Error(
        error instanceof Error
          ? error.message
          : 'An error occurred while fetching event request details',
      );
    }
  }

  async searchEventRequests(
    eventId: string,
    page: number = 1,
    pageSize: number = 10,
    searchQuery: string = '',
  ) {
    try {
      if (!eventId) {
        throw new Error('Event ID is required');
      }
      const Fuse = await getFuse();

      page = Math.max(1, page);
      pageSize = Math.max(1, pageSize);
      const skip = (page - 1) * pageSize;

      const requests = await this.prisma.eventRequest.findMany({
        where: {
          eventId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              number: true,
              picture: true,
              tickets: {
                where: {
                  ticket: {
                    eventId,
                  },
                },
                select: {
                  id: true,
                  status: true,
                  payment: true,
                  paymentReference: true,
                  ticket: {
                    select: {
                      id: true,
                      title: true,
                      price: true,
                    },
                  },
                  createdAt: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const combinedData = requests.map((request) => {
        const metaItems = Array.isArray(request.meta) ? request.meta : [];

        // Only extract email and number from meta items
        const searchFields = metaItems.map((metaItem) => {
          const item = metaItem as Record<string, any>;
          return {
            // Normalize phone number by removing spaces, dashes, and other characters
            number: (item.number?.toString() || '')
              // eslint-disable-next-line no-useless-escape
              .replace(/[\s\-\(\)\.]/g, '')
              .trim(),
            // Normalize email by converting to lowercase and trimming
            email: (item.email?.toString() || '').toLowerCase().trim(),
          };
        });

        return {
          searchFields,
          data: {
            id: request.id,
            status: request.status,
            createdAt: request.createdAt,
            user: request.user,
            metaItems,
          },
        };
      });

      let filteredRequests = combinedData;

      if (searchQuery) {
        // Normalize the search query
        const normalizedQuery = searchQuery
          .toLowerCase()
          // eslint-disable-next-line no-useless-escape
          .replace(/[\s\-\(\)\.]/g, '')
          .trim();

        // First try exact matches in meta items
        const exactMatches = combinedData.filter((item) =>
          item.searchFields.some(
            (field) =>
              field.number === normalizedQuery || // Match normalized phone number
              field.email === normalizedQuery, // Match normalized email
          ),
        );

        // If we find exact matches, return only those
        if (exactMatches.length > 0) {
          filteredRequests = exactMatches;
        } else {
          // Otherwise, use Fuse.js for fuzzy searching with strict settings
          const fuse = new Fuse(combinedData, {
            keys: ['searchFields.number', 'searchFields.email'],
            threshold: 0.1, // Very strict matching
            distance: 0, // Require consecutive matching
            minMatchCharLength: 3,
            shouldSort: true,
            ignoreLocation: true,
            useExtendedSearch: true,
          });

          const searchResults = fuse.search(normalizedQuery);
          filteredRequests = searchResults.map((result) => result.item);
        }
      }

      const transformedRequests = filteredRequests.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ searchFields, data }) => {
          const ticketsWithStatus = data.metaItems.map((metaItem) => {
            const item = metaItem as Record<string, any>;

            const purchaseRecord = data.user?.tickets?.find(
              (t) => t.ticket?.id === item.ticketId,
            );

            return {
              ticketId: item.ticketId || 'Unknown Ticket ID',
              requestInfo: {
                name: item.name || 'Unknown Name',
                email: item.email || 'Unknown Email',
                number: item.number || 'Unknown Number',
                social: item.social || 'Unknown Social',
              },
              ticketInfo: {
                title: purchaseRecord?.ticket?.title || 'Unknown Title',
                price: purchaseRecord?.ticket?.price || 0,
              },
              purchaseStatus: purchaseRecord
                ? {
                    status: purchaseRecord.status || 'UPCOMING',
                    payment: purchaseRecord.payment || 'PENDING',
                    purchaseId: purchaseRecord.id,
                    paymentReference: purchaseRecord.paymentReference || 'N/A',
                    purchasedAt: purchaseRecord.createdAt || null,
                  }
                : null,
            };
          });

          return {
            id: data.id,
            status: data.status,
            createdAt: data.createdAt,
            user: data.user
              ? {
                  id: data.user.id,
                  name: data.user.name || 'Unknown User',
                  email: data.user.email,
                  number: data.user.number,
                  picture: data.user.picture || null,
                }
              : null,
            tickets: ticketsWithStatus,
          };
        },
      );

      const paginatedRequests = transformedRequests.slice(
        skip,
        skip + pageSize,
      );

      return {
        data: paginatedRequests,
        meta: {
          total: filteredRequests.length,
          page,
          pageSize,
          totalPages: Math.ceil(filteredRequests.length / pageSize),
        },
      };
    } catch (error) {
      console.error('Error in searchEventRequests:', error);
      throw new Error(
        error instanceof Error
          ? error.message
          : 'An error occurred while searching event requests',
      );
    }
  }

  async changeRequest(
    requestId: string,
    userId: string,
    status: RequestStatus,
  ) {
    try {
      if (status === 'APPROVED') {
        const request = await this.changeRequestStatus(requestId, status);
        const formatedData = this.createTicketsArray(userId, request.meta);
        await this.prisma.ticketPurchase.createMany({
          data: formatedData,
        });

        const timeString = request.event.time;
        const date = new Date(`2024-12-25T${timeString}:00`);
        const formattedTime = format(date, 'hh:mm a');
        const data: TicketApprovalEmailProps = {
          recipientName: request.user.name,
          eventName: request.event.title,
          eventImage: request.event.image,
          eventDetails: {
            location: request.event.location,
            date: format(request.event.date, 'MMMM dd, yyyy'),
            time: formattedTime,
          },
          redirectUrl: 'https://crclevents.com/app',
        };
        this.eventEmitter.emit(
          'request.approved',
          new RequestApprovedEvent(request.user.email, data),
        );
        return true;
      } else {
        const request = await this.changeRequestStatus(requestId, status);
        const formatedData = this.createTicketIdsArray(request.meta as any);
        await this.prisma.ticketPurchase.deleteMany({
          where: {
            userId,
            ticketId: {
              in: formatedData,
            },
          },
        });
        return true;
      }
    } catch (err) {
      Logger.log('Request Status err: ', err);
      return false;
    }
  }

  async checkIfTicketBooked(ticketId: string) {
    const tickets = await this.prisma.ticketPurchase.count({
      where: {
        ticketId,
      },
    });
    const isInEventReq = await this.prisma.eventRequest.count({
      where: {
        meta: {
          equals: {
            ticketId,
          },
        },
      },
    });
    if (tickets > 0 || isInEventReq > 0) {
      throw new NotAcceptableException('Ticket already booked');
    }
    return true;
  }

  private async changeRequestStatus(requestId: string, status: RequestStatus) {
    const requestState = await this.prisma.eventRequest.update({
      where: {
        id: requestId,
      },
      include: {
        user: true,
        event: true,
      },
      data: {
        status,
      },
    });
    return requestState;
  }

  private createTicketsArray(userId: string, data: any) {
    let output;
    if (Array.isArray(data)) {
      output = data.map((elem) => {
        return {
          id: newId('ticketPurchase', 16),
          userId,
          payment: 'PENDING',
          status: 'UPCOMMING',
          meta: {
            name: elem.name,
            number: elem.number,
            email: elem.email,
          },
          ticketId: elem.ticketId,
        };
      });
    }
    return output;
  }

  private createTicketIdsArray(data: any[]) {
    if (!Array.isArray(data)) {
      throw new Error('Invalid ticket data format');
    }

    return data.map((elem) => elem.ticketId);
  }
  async exportEventRequestsToExcel(eventId: string, res: Response) {
    try {
      // Get all event requests using the existing getEventRequestDetails function
      const { data: eventRequests } = await this.getEventRequestDetails(
        eventId,
        1,
        1000000, // Setting a large page size to get all records
      );

      // Validate that we have data to export
      if (!eventRequests || eventRequests.length === 0) {
        throw new Error('No data available to export');
      }

      // Create a new Excel workbook and add a worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Event Requests');

      // Define the columns for the Excel sheet
      worksheet.columns = [
        { header: 'Request ID', key: 'requestId', width: 20 },
        { header: 'Request Status', key: 'requestStatus', width: 20 },
        { header: 'Request Date', key: 'requestDate', width: 20 },
        { header: 'User ID', key: 'userId', width: 25 },
        { header: 'User Name', key: 'userName', width: 30 },
        { header: 'User Email', key: 'userEmail', width: 30 },
        { header: 'User Phone', key: 'userPhone', width: 20 },
        { header: 'User Picture', key: 'userPicture', width: 50 },
        { header: 'Ticket ID', key: 'ticketId', width: 20 },
        { header: 'Ticket Title', key: 'ticketTitle', width: 30 },
        { header: 'Ticket Price', key: 'ticketPrice', width: 15 },
        { header: 'Requester Name', key: 'requesterName', width: 30 },
        { header: 'Requester Email', key: 'requesterEmail', width: 30 },
        { header: 'Requester Phone', key: 'requesterPhone', width: 20 },
        { header: 'Requester Social', key: 'requesterSocial', width: 30 },
        { header: 'Purchase Status', key: 'purchaseStatus', width: 20 },
        { header: 'Payment Status', key: 'paymentStatus', width: 20 },
        { header: 'Purchase ID', key: 'purchaseId', width: 30 },
        { header: 'Payment Reference', key: 'paymentReference', width: 30 },
        { header: 'Purchase Date', key: 'purchaseDate', width: 20 },
      ];

      // Add data rows
      eventRequests.forEach((request) => {
        // For each ticket in the request
        if (request.tickets && request.tickets.length > 0) {
          request.tickets.forEach((ticket) => {
            const requestDate = request.createdAt
              ? new Date(request.createdAt)
              : new Date();
            const purchaseDate = ticket.purchaseStatus?.purchasedAt
              ? new Date(ticket.purchaseStatus.purchasedAt)
              : null;

            worksheet.addRow({
              requestId: request.id || 'N/A',
              requestStatus: request.status || 'N/A',
              requestDate: requestDate.toLocaleDateString(),
              userId: request.user?.id || 'N/A',
              userName: request.user?.name || 'Unknown User',
              userEmail: request.user?.email || 'N/A',
              userPhone: request.user?.number || 'N/A',
              userPicture: request.user?.picture || 'N/A',
              ticketId: ticket.ticketId || 'N/A',
              ticketTitle: ticket.ticketInfo?.title || 'N/A',
              ticketPrice: ticket.ticketInfo?.price || 0,
              requesterName: ticket.requestInfo?.name || 'N/A',
              requesterEmail: ticket.requestInfo?.email || 'N/A',
              requesterPhone: ticket.requestInfo?.number || 'N/A',
              requesterSocial: ticket.requestInfo?.social || 'N/A',
              purchaseStatus: ticket.purchaseStatus?.status || 'N/A',
              paymentStatus: ticket.purchaseStatus?.payment || 'N/A',
              purchaseId: ticket.purchaseStatus?.purchaseId || 'N/A',
              paymentReference:
                ticket.purchaseStatus?.paymentReference || 'N/A',
              purchaseDate: purchaseDate
                ? purchaseDate.toLocaleDateString()
                : 'N/A',
            });
          });
        }
      });

      // Apply some styling to the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };

      // Auto-filter for all columns
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: worksheet.columns.length },
      };

      // Generate buffer instead of writing directly to response
      const buffer = await workbook.xlsx.writeBuffer();

      // Set up the response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="event_requests_${eventId}_${new Date().toISOString().split('T')[0]}.xlsx"`,
      );
      res.setHeader('Content-Length', buffer.byteLength);

      // Send the buffer
      res.send(buffer);
    } catch (error) {
      console.error('Error in exportEventRequestsToExcel:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
        });
      }
      throw new Error('An error occurred while generating the Excel file');
    }
  }
}
