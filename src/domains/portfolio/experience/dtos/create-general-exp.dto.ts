import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBooleanString,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { parseJsonArray } from 'src/common/helpers';
import { EXPERIENCE_TYPE_ENUM, ExperienceType } from 'src/types/portfolio';

@ValidatorConstraint({ name: 'ValidExperienceDates', async: false })
class ValidExperienceDatesConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { startDate, endDate, ongoing } = args.object as any;
    const ongoingBool = ongoing === true || ongoing === 'true' || ongoing === 1 || ongoing === '1';

    if (!startDate) return true;

    const start = new Date(startDate as string);
    const end = endDate ? new Date(endDate as string) : null;

    // If ongoing is true, endDate must not exist.
    if (ongoingBool && end) return false;

    // If ongoing is false or undefined, endDate must exist and be after
    if (!ongoingBool && end) {
      return end > start;
    }

    // If ongoing is false and there is no endDate => invalid
    if (!ongoingBool && !end) return false;

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments): string {
    return 'Invalid dates: endDate must be after startDate, and required unless ongoing is true.';
  }
}

export class CreateExperienceGeneralDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(EXPERIENCE_TYPE_ENUM)
  type: ExperienceType;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseJsonArray(value))
  technologies?: string[];

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBooleanString()
  ongoing?: boolean;

  //  This property does not exist in the schema, it only executes the cross validation.
  @Validate(ValidExperienceDatesConstraint)
  private readonly __validateDates?: never;
}
