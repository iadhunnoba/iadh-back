import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { MinLength, IsNotEmpty, IsEmail } from "class-validator"
import * as bcrypt from "bcryptjs"

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

    @Column()           // Matricula profesional
    license: string

    @Column()           // Legajo estudiantil
    studentIdNumber: string 

    @Column()           // Materia del estudiante
    subject: string

    @Column()           // Comisión del estudiante
    section: string

    @Column({ select: false })  // Excluye el campo password en las consultas por defecto
    @MinLength(6)
    @IsNotEmpty()
    password: string

    @Column({
        type: "enum",
        enum: ["admin", "user"],
        default: "user"
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