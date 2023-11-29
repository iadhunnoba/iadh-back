import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"
import { IsNotEmpty } from "class-validator"

@Entity()
export class DataMqtt {

    @PrimaryGeneratedColumn()
    id: string

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    @IsNotEmpty()
    data: number;
}
