import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray,
  IsUrl,
  ValidateNested,
  IsIn,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PROJECT_STATUSES, PROJECT_TYPES, ProjectStatus, ProjectType } from 'src/types/portfolio';
import { parseJsonArray } from 'src/common/helpers';

@ValidatorConstraint({ name: 'ValidProjectDates', async: false })
class ValidProjectDatesConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { startDate, endDate, status } = args.object as any;

    if (!startDate) return true;

    const start = new Date(startDate as string);
    const end = endDate ? new Date(endDate as string) : null;

    if (status === 'completed') {
      return !!end && end > start;
    }

    if (end) {
      return end > start;
    }

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments): string {
    return 'endDate must be later than startDate, and mandatory if the status is “completed”.';
  }
}

class ProjectLinksDto {
  @IsOptional()
  @IsUrl()
  github?: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}

export class CreateProjectGeneralDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(PROJECT_TYPES)
  type: ProjectType;

  @IsOptional()
  @IsDateString()
  startDate: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsString()
  @IsNotEmpty()
  @IsIn(PROJECT_STATUSES)
  status: ProjectStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseJsonArray(value))
  technologies?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectLinksDto)
  links?: ProjectLinksDto;

  //  This property does not exist in the schema, it only executes the cross validation.
  @Validate(ValidProjectDatesConstraint)
  private readonly __validateDates?: never;
}
