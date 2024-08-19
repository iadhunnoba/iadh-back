import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { IsNotEmpty, IsDate } from "class-validator";

@Entity()
export class Sesion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @IsDate()
  fechaInicio: Date;

  @Column({ nullable: true }) // Permite que la fecha de finalización sea opcional al principio
  @IsDate()
  fechaFin?: Date;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
