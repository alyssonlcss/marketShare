import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Distribuidor } from './distribuidor.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  nome: string;

  @ManyToOne(() => Distribuidor, { nullable: false })
  distribuidor: Distribuidor;
}
