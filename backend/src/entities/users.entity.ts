import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    pseudo: string

    @Column()
    email : string

    @Column()
	password : string
    @Column()
    age: number
}