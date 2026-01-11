import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePropriedadeRuralDto {
	@IsString()
	@IsNotEmpty()
	cultura: string;

	@IsNumber()
	hectares: number;

	@IsString()
	@IsNotEmpty()
	@Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
	@IsIn(
		[
			'AC',
			'AL',
			'AP',
			'AM',
			'BA',
			'CE',
			'DF',
			'ES',
			'GO',
			'MA',
			'MT',
			'MS',
			'MG',
			'PA',
			'PB',
			'PR',
			'PE',
			'PI',
			'RJ',
			'RN',
			'RS',
			'RO',
			'RR',
			'SC',
			'SP',
			'SE',
			'TO',
		],
		{ message: 'uf inválida' },
	)
	uf: string;

	@IsString()
	@IsNotEmpty()
	cidade: string;
	@IsOptional()
	geometria?: string;

	@IsNumber()
	leadId: number;

	@IsOptional()
	@IsNumber()
	distribuidorId?: number;

	@IsNumber()
	latitude: number;

	@IsNumber()
	longitude: number;
}
