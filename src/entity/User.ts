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
    @MinLength(6)
    @IsNotEmpty()
    password: string

    @Column()
    @IsNotEmpty()
    role: string

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    @UpdateDateColumn()
    updatedAt: Date;

    // A la hora de crear el usuario se encriptara la password, este metodo se encarga de encriptar
    hashPassword(): void {
        const salt = bcrypt.genSaltSync(10);
        this.password = bcrypt.hashSync(this.password, salt)
    }

    // A la hora de loguearse se comparara la password ingresada con la password de la base de datos
    checkPassword(password: string): boolean {
        return bcrypt.compareSync(password, this.password)
    }
}
