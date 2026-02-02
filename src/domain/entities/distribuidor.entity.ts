import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Produto } from './produto.entity';
import { PropriedadeRural } from './propriedade-rural.entity';
import { Lead } from './lead.entity';

@Entity()
export class Distribuidor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  cnpj: string;

  @Column()
  nome: string;

  @Column()
  geografia: string;

  @Column()
  email: string;

  @OneToMany(() => Produto, (produto: Produto) => produto.distribuidor, { nullable: false })
  produtos: Produto[];

  @OneToMany(() => Lead, (lead: Lead) => lead.distribuidor, { nullable: true })
  leads: Lead[];

  @OneToMany(() => PropriedadeRural, (propriedade: PropriedadeRural) => propriedade.distribuidor, { nullable: true })
  propriedadesRurais: PropriedadeRural[];
}
