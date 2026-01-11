import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Distribuidor } from '../../distribuidor/entity/distribuidor.entity';

export enum UnidadeMedida {
  TONELADA = 'tonelada',
  QUILO = 'quilo',
  LITRO = 'litro',
  QUILOLITRO = 'quilolitro',
  METRO = 'metro',
  QUILOMETRO = 'quilometro',
}

@Entity()
export class Produto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nome: string;

  @Column('text', { array: true, nullable: true })
  categoria?: string[];

  @Column('decimal')
  custoUnidade: number;

  @Column({
    type: 'enum',
    enum: UnidadeMedida,
    nullable: false,
  })
  unidadeMedida: UnidadeMedida;

  @ManyToOne(() => Distribuidor, (distribuidor) => distribuidor.produtos, { nullable: false })
  distribuidor: Distribuidor;
}
