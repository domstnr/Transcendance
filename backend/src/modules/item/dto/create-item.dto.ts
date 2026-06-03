import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { ITEM_CATEGORIES, type ItemCategory } from '../item-category';

export class CreateItemDto {
    @IsString()
    @IsNotEmpty({ message: 'title is required.' })
    title!: string;

    @IsString()
    @IsNotEmpty({ message: 'description is required.' })
    description!: string;

    @Type(() => Number)
    @IsInt({ message: 'condition must be an integer.' })
    @Min(1, { message: 'condition must be between 1 and 10.' })
    @Max(10, { message: 'condition must be between 1 and 10.' })
    condition!: number;

    @IsString()
    @IsIn(ITEM_CATEGORIES, { message: 'category must be one of the supported listing categories.' })
    category!: ItemCategory;

    @Type(() => Number)
    @IsNumber({}, { message: 'startPrice must be a number.' })
    @Min(0.01, { message: 'startPrice must be greater than 0.' })
    startPrice!: number;

    @IsDateString({}, { message: 'endDate must be a valid ISO date.' })
    endDate!: string;
}
