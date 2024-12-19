import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsRequiredForFieldValue(
  typeProperty: string, // The property name to check against (e.g., 'type')
  expectedValue: any, // The value to check the `typeProperty` against (e.g., 'paid')
  validationOptions?: ValidationOptions, // Optional validation options
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsRequiredForFieldValue',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [typeProperty, expectedValue], // Store the name of the type property and the expected value
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const object = args.object as any;
          const type = object[typeProperty]; // Get the value of the `type` field
          const expected = args.constraints[1]; // Get the expected value (e.g., 'paid')

          // If the `type` field equals `expectedValue` and the current property (e.g., `ticketId`) is empty, return false
          if (type === expected && !value) {
            return false; // Validation fails, because the field should be required when `type` is equal to `expectedValue`
          }

          return true; // Validation passes if `type` doesn't equal `expectedValue` or `value` is present
        },
        defaultMessage(args: ValidationArguments) {
          // Dynamic error message
          return `${args.property} must be provided when ${args.constraints[0]} is '${args.constraints[1]}'`;
        },
      },
    });
  };
}
