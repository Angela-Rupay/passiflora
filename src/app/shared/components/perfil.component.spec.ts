import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlertController } from '@ionic/angular';
import { PerfilComponent } from './perfil.component';
import { AuthService } from '../../services/auth.service';
import { CamaraService } from '../../services/camara.service';

describe('Perfil en Mi espacio', () => {
  const obtenerPerfil = vi.fn();
  const actualizarPerfil = vi.fn();
  const capturar = vi.fn();
  const elegirAvatar = vi.fn();
  const create = vi.fn();
  const foto = 'data:image/jpeg;base64,Zm90bw==';
  beforeEach(() => {
    localStorage.clear();
    obtenerPerfil.mockReset().mockResolvedValue({ nombre: 'Ángela Rupay', correo: 'angela@example.com' });
    actualizarPerfil.mockReset().mockResolvedValue(undefined);
    capturar.mockReset().mockResolvedValue(foto);
    elegirAvatar.mockReset().mockResolvedValue(foto);
    create.mockReset().mockResolvedValue({ present: vi.fn(), onDidDismiss: vi.fn().mockResolvedValue({ role: 'cancel' }) });
    TestBed.configureTestingModule({ imports: [PerfilComponent], providers: [
      { provide: AuthService, useValue: { obtenerPerfil, actualizarPerfil } },
      { provide: CamaraService, useValue: { capturar, elegirAvatar } },
      { provide: AlertController, useValue: { create } },
    ] });
  });
  function pagina() { return TestBed.createComponent(PerfilComponent).componentInstance; }
  it('guarda la foto por cuenta únicamente en el dispositivo', async () => {
    const p = pagina(); p.uid = 'angela'; await p.cargar();
    await p.cambiarFoto(false);
    expect(localStorage.getItem('passiflora:avatar:v1:angela')).toBe(foto);
    expect(actualizarPerfil).not.toHaveBeenCalled();
    p.uid = 'valeria'; await p.cargar(); expect(p.avatar).toBe('');
    p.uid = 'angela'; await p.cargar(); expect(p.avatar).toBe(foto);
    p.quitarFoto(); expect(localStorage.getItem('passiflora:avatar:v1:angela')).toBeNull();
  });
  it('no abre la cámara sin aceptar el aviso', async () => {
    const p = pagina(); p.uid = 'angela'; await p.cargar();
    await p.cambiarFoto(true); expect(capturar).not.toHaveBeenCalled();
  });
  it('valida ambos campos y guarda nombres sin alterar correo', async () => {
    const p = pagina(); p.uid = 'angela'; await p.cargar(); p.editar();
    p.nombres = 'Ana'; await p.guardar(); expect(actualizarPerfil).not.toHaveBeenCalled();
    p.nombres = 'Angela123'; expect(p.valido).toBe(false);
    p.nombres = 'Ángela Sofía'; p.apellido = 'Rupay'; await p.guardar();
    expect(actualizarPerfil).toHaveBeenCalledWith('angela', 'Ángela Sofía', 'Rupay');
    expect(p.perfil?.correo).toBe('angela@example.com'); expect(p.editando).toBe(false);
  });
  it('ignora una foto pendiente si cambia la cuenta', async () => {
    let resolver!: (foto: string) => void;
    elegirAvatar.mockImplementationOnce(() => new Promise<string>(r => resolver = r));
    const p = pagina(); p.uid = 'angela'; await p.cargar();
    const pendiente = p.cambiarFoto(false);
    p.uid = 'valeria'; await p.cargar(); resolver(foto); await pendiente;
    expect(p.avatar).toBe(''); expect(localStorage.getItem('passiflora:avatar:v1:angela')).toBeNull();
  });
});
