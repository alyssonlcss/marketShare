import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { PropriedadeRural } from '../../propriedade-rural/entity/propriedade-rural.entity';
import { Distribuidor } from './distribuidor.entity';

export enum LeadStatus {
	NOVO = 'novo',
	CONTATO_INICIAL = 'contatoInicial',
	NEGOCIANDO = 'negociando',
	CONVERTIDO = 'convertido',
	PERDIDO = 'perdido',
}

@Entity()
export class Lead {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: false })
	nome: string;

	@Column({ nullable: false, unique: true })
	cpf: string;

	@Column({ nullable: true })
	email: string;

	@Column({ nullable: true })
	telefone: string;

	@Column({
		type: 'enum',
		enum: LeadStatus,
		default: LeadStatus.NOVO,
	})
	status: LeadStatus;

	@ManyToOne(() => Distribuidor, (distribuidor) => distribuidor.leads, { nullable: true })
	@JoinColumn({ name: 'distribuidorId' })
	distribuidor?: Distribuidor;

	@Column({ type: 'text', nullable: true })
	comentario?: string;

	@OneToMany(() => PropriedadeRural, (propriedade) => propriedade.lead)
	propriedadesRurais: PropriedadeRural[];
}
