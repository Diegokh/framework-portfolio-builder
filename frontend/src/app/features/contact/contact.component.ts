import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ContactService } from '../../core/services/contact.service';
import { AuthService } from '../../core/auth/auth.service';
import { Message } from '../../core/models/message.model';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <div class="px-8 py-6">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-[var(--app-text-primary)]">Mensajes recibidos</h1>
          <p class="text-sm text-[var(--app-text-muted)] mt-1">Bandeja de entrada de tu portfolio</p>
        </div>
        @if (unreadCount() > 0) {
          <span class="px-2.5 py-1 rounded-full bg-[#1f6feb]/20 text-[#58a6ff] border border-[#1f6feb]/30 text-sm font-medium">
            {{ unreadCount() }} sin leer
          </span>
        }
      </div>

      <div class="flex gap-2 mb-6 border-b border-[var(--app-border)]">
        <button (click)="showTab.set('inbox')"
                [class]="showTab() === 'inbox' ? 'text-[var(--app-text-primary)] border-b-2 border-[var(--app-accent)]' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]'"
                class="px-3 pb-3 text-sm font-medium transition-colors">
          Bandeja
          @if (unreadCount() > 0) {
            <span class="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#1f6feb] text-white text-[10px] font-bold">{{ unreadCount() }}</span>
          }
        </button>
        <button (click)="showTab.set('send')"
                [class]="showTab() === 'send' ? 'text-[var(--app-text-primary)] border-b-2 border-[var(--app-accent)]' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]'"
                class="px-3 pb-3 text-sm font-medium transition-colors">
          Enviar mensaje de prueba
        </button>
      </div>

      @if (showTab() === 'inbox') {
        @if (messages().length === 0) {
          <div class="flex flex-col items-center justify-center py-20">
            <mat-icon class="text-[var(--app-text-subtle)] mb-3" style="font-size:48px;width:48px;height:48px;line-height:48px">mail_outline</mat-icon>
            <p class="text-[var(--app-text-muted)]">No has recibido mensajes todavía</p>
            <p class="text-[var(--app-text-subtle)] text-sm mt-1">Los mensajes enviados desde tu portfolio público aparecerán aquí</p>
          </div>
        } @else {
          <div class="flex flex-col gap-2">
            @for (msg of messages(); track msg.id) {
              <div class="bg-[var(--app-surface)] border rounded-xl p-4 transition-colors hover:border-[var(--app-accent)]"
                   [class]="msg.isRead ? 'border-[var(--app-border)]' : 'border-[var(--app-accent)]/50'">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex items-start gap-3 flex-1 min-w-0">
                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {{ msg.fromName[0]?.toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-semibold text-[var(--app-text-primary)] text-sm">{{ msg.fromName }}</span>
                        @if (!msg.isRead) {
                          <span class="w-2 h-2 rounded-full bg-[#58a6ff] shrink-0"></span>
                        }
                        <span class="text-[var(--app-text-subtle)] text-xs ml-auto shrink-0">{{ formatDate(msg.createdAt) }}</span>
                      </div>
                      <p class="text-[var(--app-text-muted)] text-xs mt-0.5">{{ msg.fromEmail }}</p>
                      <p class="text-[var(--app-text-primary)] text-sm mt-2 line-clamp-3">{{ msg.body }}</p>
                    </div>
                  </div>

                  <div class="flex gap-1 shrink-0">
                    @if (!msg.isRead) {
                      <button (click)="markRead(msg)"
                              class="p-1.5 rounded-lg hover:bg-[var(--app-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-accent)] transition-colors"
                              title="Marcar como leído">
                        <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px">mark_email_read</mat-icon>
                      </button>
                    }
                    <button (click)="delete(msg.id)"
                            class="p-1.5 rounded-lg hover:bg-[var(--app-hover)] text-[var(--app-text-muted)] hover:text-red-400 transition-colors"
                            title="Eliminar">
                      <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px">delete</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      }

      @if (showTab() === 'send') {
        <div class="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl p-5 max-w-lg">
          <p class="text-[var(--app-text-muted)] text-sm mb-4">
            Simula cómo un visitante de tu portfolio te enviaría un mensaje. En producción este formulario estará en tu portfolio público.
          </p>
          <form [formGroup]="sendForm" (ngSubmit)="sendTest()" class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs text-[var(--app-text-muted)]">Nombre</label>
              <input formControlName="fromName" placeholder="Juan García"
                     class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors placeholder-[var(--app-text-subtle)]" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-[var(--app-text-muted)]">Email</label>
              <input formControlName="fromEmail" type="email" placeholder="juan@ejemplo.com"
                     class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors placeholder-[var(--app-text-subtle)]" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-[var(--app-text-muted)]">Mensaje</label>
              <textarea formControlName="body" rows="4" placeholder="Hola, he visto tu portfolio y me interesa..."
                        class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors placeholder-[var(--app-text-subtle)] resize-none"></textarea>
            </div>
            @if (sendSuccess()) {
              <p class="text-green-400 text-sm flex items-center gap-1.5">
                <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px">check_circle</mat-icon>
                Mensaje enviado. Ve a la pestaña Bandeja para verlo.
              </p>
            }
            <button type="submit" [disabled]="sendForm.invalid"
                    class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px">send</mat-icon>
              Enviar mensaje de prueba
            </button>
          </form>
        </div>
      }
    </div>
  `,
  styles: `
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `,
})
export class ContactComponent implements OnInit {
  private readonly service = inject(ContactService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  messages = signal<Message[]>([]);
  showTab = signal<'inbox' | 'send'>('inbox');
  sendSuccess = signal(false);

  unreadCount = computed(() => this.messages().filter(m => !m.isRead).length);

  sendForm = this.fb.group({
    fromName: ['', Validators.required],
    fromEmail: ['', [Validators.required, Validators.email]],
    body: ['', Validators.required],
  });

  ngOnInit() {
    this.load();
  }

  private load() {
    this.service.getInbox().subscribe(res => this.messages.set(res.data));
  }

  markRead(msg: Message) {
    this.service.markAsRead(msg.id).subscribe(() =>
      this.messages.update(list => list.map(m => m.id === msg.id ? { ...m, isRead: 1 } : m))
    );
  }

  delete(id: number) {
    this.service.delete(id).subscribe(() =>
      this.messages.update(list => list.filter(m => m.id !== id))
    );
  }

  sendTest() {
    const { fromName, fromEmail, body } = this.sendForm.value;
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;

    this.service.send(userId, fromName!, fromEmail!, body!).subscribe(() => {
      this.sendSuccess.set(true);
      this.sendForm.reset();
      setTimeout(() => this.sendSuccess.set(false), 4000);
    });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
}
