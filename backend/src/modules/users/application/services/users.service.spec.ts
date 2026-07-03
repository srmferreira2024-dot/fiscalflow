import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { UsersRepository } from '../../infrastructure/users.repository';
import { OfficesService } from '../../../offices/application/services/offices.service';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: UsersRepository;
  let officesService: OfficesService;

  beforeEach(async () => {
    usersRepository = {
      findAllByOffice: jest.fn(),
      findByIdAndOffice: jest.fn(),
      findByEmailAndOffice: jest.fn(),
      create: jest.fn(),
      updateByIdAndOffice: jest.fn(),
    } as any as UsersRepository;

    officesService = {
      getById: jest.fn().mockResolvedValue({ id: 'office-1' }),
    } as any as OfficesService;

    service = new UsersService(usersRepository, officesService);
  });

  describe('inviteUser', () => {
    it('cria um novo usuário', async () => {
      (usersRepository.findByEmailAndOffice as jest.Mock).mockResolvedValue(null);
      (usersRepository.create as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'novo@test.com',
        role: UserRole.CONTADOR,
      });

      const result = await service.inviteUser('office-1', {
        email: 'novo@test.com',
        name: 'Novo Usuário',
        role: UserRole.CONTADOR,
      });

      expect(result.email).toBe('novo@test.com');
      expect(usersRepository.create).toHaveBeenCalled();
    });

    it('rejeita se email já existe', async () => {
      (usersRepository.findByEmailAndOffice as jest.Mock).mockResolvedValue({ id: 'user-1' });

      await expect(
        service.inviteUser('office-1', {
          email: 'existing@test.com',
          name: 'User',
          role: UserRole.CONTADOR,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deactivateUser', () => {
    it('desativa usuário', async () => {
      (usersRepository.findByIdAndOffice as jest.Mock).mockResolvedValue({ id: 'user-1' });
      (usersRepository.updateByIdAndOffice as jest.Mock).mockResolvedValue({
        id: 'user-1',
        isActive: false,
      });

      const result = await service.deactivateUser('user-1', 'office-1');

      expect(result.isActive).toBe(false);
    });

    it('lança erro se usuário não encontrado', async () => {
      (usersRepository.findByIdAndOffice as jest.Mock).mockResolvedValue(null);

      await expect(service.deactivateUser('nonexistent', 'office-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
