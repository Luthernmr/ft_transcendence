/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';

import { UserEntity } from 'src/entities/users.entity';

async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
