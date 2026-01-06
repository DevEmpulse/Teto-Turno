'use client';

import * as React from 'react';
import Link from 'next/link';
import { HiOutlineArrowLeft, HiOutlinePlus, HiOutlineEllipsisVertical } from 'react-icons/hi2';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { Avatar } from '@/presentation/components/ui/avatar';
import { Input } from '@/presentation/components/ui/input';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'staff';
  status: 'active' | 'pending';
  lastActive?: string;
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@teto.app',
    role: 'owner',
    status: 'active',
    lastActive: 'Ahora',
  },
  {
    id: '2',
    name: 'Juan Pérez',
    email: 'juan@teto.app',
    role: 'staff',
    status: 'active',
    lastActive: 'Hace 2 horas',
  },
  {
    id: '3',
    name: 'Ana López',
    email: 'ana@teto.app',
    role: 'admin',
    status: 'active',
    lastActive: 'Hace 1 día',
  },
  {
    id: '4',
    name: 'Carlos Ruiz',
    email: 'carlos@teto.app',
    role: 'staff',
    status: 'pending',
  },
];

const roleConfig = {
  owner: { label: 'Propietario', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  admin: { label: 'Administrador', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  staff: { label: 'Staff', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
};

export default function TeamSettingsPage() {
  const [inviteEmail, setInviteEmail] = React.useState('');

  return (
    <div className="animate-in max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/settings"
          className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800"
        >
          <HiOutlineArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            Equipo
          </h1>
          <p className="mt-1 text-surface-500">
            Administra los usuarios con acceso al sistema
          </p>
        </div>
      </div>

      {/* Invite */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Invitar Miembro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="email@ejemplo.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <select className="rounded-xl border border-surface-300 bg-white px-4 py-2 text-sm dark:border-surface-700 dark:bg-surface-900">
              <option value="staff">Staff</option>
              <option value="admin">Administrador</option>
            </select>
            <Button variant="glow" leftIcon={<HiOutlinePlus className="h-5 w-5" />}>
              Invitar
            </Button>
          </div>
          <p className="mt-2 text-sm text-surface-500">
            Se enviará un email de invitación para unirse al equipo
          </p>
        </CardContent>
      </Card>

      {/* Team members */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Miembros del Equipo</CardTitle>
            <Badge variant="secondary">{teamMembers.length} miembros</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-xl border border-surface-200 p-4 dark:border-surface-800"
              >
                <div className="flex items-center gap-4">
                  <Avatar name={member.name} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-surface-900 dark:text-surface-50">
                        {member.name}
                      </p>
                      {member.status === 'pending' && (
                        <Badge variant="warning" size="sm">Pendiente</Badge>
                      )}
                    </div>
                    <p className="text-sm text-surface-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={roleConfig[member.role].color}>
                    {roleConfig[member.role].label}
                  </Badge>
                  {member.lastActive && (
                    <span className="hidden text-sm text-surface-500 sm:block">
                      {member.lastActive}
                    </span>
                  )}
                  {member.role !== 'owner' && (
                    <Button variant="ghost" size="icon-sm">
                      <HiOutlineEllipsisVertical className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Roles explanation */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Roles y Permisos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-xl border border-surface-200 p-4 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <Badge className={roleConfig.owner.color}>Propietario</Badge>
              </div>
              <p className="mt-2 text-sm text-surface-500">
                Acceso total al sistema, facturación y configuración de la cuenta
              </p>
            </div>
            <div className="rounded-xl border border-surface-200 p-4 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <Badge className={roleConfig.admin.color}>Administrador</Badge>
              </div>
              <p className="mt-2 text-sm text-surface-500">
                Gestión de citas, personal, servicios y reportes. Sin acceso a facturación
              </p>
            </div>
            <div className="rounded-xl border border-surface-200 p-4 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <Badge className={roleConfig.staff.color}>Staff</Badge>
              </div>
              <p className="mt-2 text-sm text-surface-500">
                Ver y gestionar solo sus propias citas. Sin acceso a configuración
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

