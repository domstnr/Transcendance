import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PlaceBidDto {
    @Type(() => Number)
    @IsNumber({}, { message: 'amount must be a number.' })
    @Min(0.01, { message: 'amount must be greater than 0.' })
    amount!: number;
}
