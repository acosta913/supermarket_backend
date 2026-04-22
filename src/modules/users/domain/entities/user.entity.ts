export type UserEntity = {
  id: string;
  name: string;
  email: string;
  password: string;
  roleId: string;
  role: {
    id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
