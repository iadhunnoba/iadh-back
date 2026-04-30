import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { RcpSession } from "./RcpSession";

@Entity()
export class SessionEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RcpSession, (session) => session.events, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "session_id" })
  session: RcpSession;

  @Column({ type: "varchar", length: 100 })
  eventType: string;

  @Column({ type: "json", nullable: true })
  eventData: object | null;

  @Column({ type: "text", nullable: true })
  observation: string | null;

  @Column({ type: "int", default: 0 })
  sessionTimeSeconds: number;

  @CreateDateColumn()
  createdAt: Date;
}
