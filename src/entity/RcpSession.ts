import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { IsNotEmpty, IsDate, IsOptional } from "class-validator";
import { User } from "./User";

@Entity()
export class RcpSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "student_id" })
  @IsNotEmpty()
  student: User;

  @Column({ type: "timestamp" })
  @IsNotEmpty()
  @IsDate()
  startedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  @IsOptional()
  @IsDate()
  endedAt?: Date;

  @Column({ type: "int", nullable: true })
  @IsOptional()
  duration?: number; // Duración en minutos o segundos

  @Column({ type: "float", nullable: true })
  @IsOptional()
  avgPulmonaryPressure?: number;

  @Column({ type: "float", nullable: true })
  @IsOptional()
  avgVentilation?: number;

  @Column({ type: "float", nullable: true })
  @IsOptional()
  avgCorrectPosition?: number;

  @Column({ type: "text", nullable: true })
  @IsOptional()
  observation?: string;

  @Column()   // date of creation
  @CreateDateColumn()
  createdAt: Date;


  // Método para calcular la duración automáticamente
  calculateDuration(): void {
    if (this.startedAt && this.endedAt) {
      const diffMs = this.endedAt.getTime() - this.startedAt.getTime();
      this.duration = Math.floor(diffMs / 1000); // Duración en segundos
    }
  }
}