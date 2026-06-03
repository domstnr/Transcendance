import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { ITEM_CATEGORIES, type ItemCategory } from '../item-category';

export class UpdateItemDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'title cannot be empty.' })
    title?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'description cannot be empty.' })
    description?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'condition must be an integer.' })
    @Min(1, { message: 'condition must be between 1 and 10.' })
    @Max(10, { message: 'condition must be between 1 and 10.' })
    condition?: number;

    @IsOptional()
    @IsString()
    @IsIn(ITEM_CATEGORIES, { message: 'category must be one of the supported listing categories.' })
    category?: ItemCategory;
}
