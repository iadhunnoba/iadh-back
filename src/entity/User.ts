import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { MinLength, IsNotEmpty, IsEmail } from "class-validator"
import * as bcrypt from "bcryptjs"
import { IsOptional } from "class-validator"

@Entity()
@Unique(['username'])
export class User {

    @PrimaryGeneratedColumn()
    id: string

    @Column()
    @MinLength(6)
    @IsNotEmpty()
    @IsEmail()
    username: string

    @Column()
    @IsNotEmpty()
    name: string

    @Column()
    @IsNotEmpty()
    surname: string

    @Column({ nullable: true })
    @IsOptional()         // Matricula profesional
    license: string

    @Column({ nullable: true })           // Legajo estudiantil
    @IsOptional()
    studentIdNumber: string 

    @Column({ nullable: true })           // Materia del estudiante
    @IsOptional()
    subject: string

    @Column({ nullable: true })           // Comisión del estudiante
    @IsOptional()
    section: string

    @Column({ select: false })  // Excluye el campo password en las consultas por defecto
    @MinLength(6)
    @IsNotEmpty()
    password: string

    @Column({
        type: "enum",
        enum: ["admin", "profesor", "estudiante"],
        default: "estudiante"
    })
    @IsNotEmpty()
    role: string; 

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    @UpdateDateColumn()
    updatedAt: Date;

    hashPassword(): void {
        const salt = bcrypt.genSaltSync(10);
        this.password = bcrypt.hashSync(this.password, salt)
    }

    checkPassword(password: string): boolean {
        return bcrypt.compareSync(password, this.password)
    }
}