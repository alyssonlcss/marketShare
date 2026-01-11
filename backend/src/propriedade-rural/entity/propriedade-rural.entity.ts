import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Lead } from '../../lead/entity/lead.entity';
import { Distribuidor } from '../../distribuidor/entity/distribuidor.entity';

@Entity()
export class PropriedadeRural {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cultura: string;

  @Column('float')
  hectares: number;

  @Column({ nullable: false })
  uf: string;

  @Column({ nullable: false })
  cidade: string;

  @Column({ nullable: true })
  geometria?: string;

  @ManyToOne(() => Distribuidor, (distribuidor) => distribuidor.propriedadesRurais, { nullable: true })
  @JoinColumn({ name: 'distribuidorId' })
  distribuidor?: Distribuidor;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @ManyToOne(() => Lead, (lead) => lead.propriedadesRurais, { nullable: false })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;
}
