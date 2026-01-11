import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValidCPF } from './cpf.util';

@ValidatorConstraint({ name: 'IsCPF', async: false })
export class CPFConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return isValidCPF(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} inválido`;
  }
}

export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsCPF',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: CPFConstraint,
    });
  };
}
