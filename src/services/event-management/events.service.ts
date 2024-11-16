import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  Event,
  PaymentStatus,
  RequestStatus,
  Ticket,
  TicketStatus,
} from '@prisma/client';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { newId } from 'src/common/uniqueId.utils';
import { CreateTicketDto, UpdateTicketDto } from './dto/tickets.dto';
import { getFuse } from 'src/shared/auth/shared/fues';

interface RequestMetaItem {
  name: string;
  email: string;
  number: string;
  social: string;
  ticketId: string;
}

@Injectable()
export class EventsManagementService {
  constructor(private readonly prisma: PrismaService) {}

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
      include: { tickets: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return { event };
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
      return await this.prisma.ticket.delete({
        where: { id },
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

      return {
        data: transformedRequests,
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
        return true;
      } else {
        const request = await this.changeRequestStatus(requestId, status);
        const formatedData = this.createTicketIdsArray(request.meta);
        await this.prisma.ticketPurchase.deleteMany({
          where: {
            userId,
            ticketId: formatedData,
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
      data: {
        status,
      },
    });
    return requestState;
  }

  private createTicketsArray(userId: string, data: any) {
    let output;
    if (Array.isArray(data)) {
      data.forEach((elem) => {
        output = {
          id: newId('ticketPurchase', 16),
          userId,
          payment: 'PENDING',
          status: 'UPCOMMING',
          meta: elem.meta,
          ticketId: elem.ticketId,
        };
      });
    }
    return output;
  }

  private createTicketIdsArray(data: any) {
    let output;
    if (typeof data === 'object') {
      data.forEach((elem) => {
        output = {
          ticketId: elem.ticketId,
        };
      });
    }
    return output;
  }
}
