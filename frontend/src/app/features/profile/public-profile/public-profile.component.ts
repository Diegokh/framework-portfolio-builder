import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../core/services/profile.service';
import { Profile } from '../../../core/models/profile.model';
import { Project } from '../../../core/models/project.model';
import { Link } from '../../../core/models/link.model';
import { environment } from '../../../../environments/environment';

interface Screenshot { id: number; imageUrl: string; caption: string; order: number; }

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDividerModule, MatProgressSpinnerModule, FormsModule],
  template: `
    <div class="page">

      <!-- Spinner inicial -->
      <div *ngIf="loading()" class="center-spin"><mat-spinner></mat-spinner></div>

      <div *ngIf="!loading() && profile()" class="layout">

        <!-- PERFIL -->
        <div class="profile-card">
          <div class="profile-header">
            <div class="avatar"><mat-icon>person</mat-icon></div>
            <div>
              <h1>Perfil Profesional</h1>
              <span class="updated" *ngIf="profile()?.updatedAt">
                Actualizado {{ profile()?.updatedAt | date:'mediumDate' }}
              </span>
            </div>
          </div>

          <div class="profile-body">
            <div class="info-block" *ngIf="profile()?.bio">
              <div class="block-title"><mat-icon>description</mat-icon> Acerca de</div>
              <p class="bio">{{ profile()?.bio }}</p>
            </div>

            <div class="info-block" *ngIf="getSkills().length">
              <div class="block-title"><mat-icon>star</mat-icon> Skills</div>
              <div class="skills-row">
                <span class="skill-chip" *ngFor="let s of getSkills()">{{ s }}</span>
              </div>
            </div>

            <div class="info-block" *ngIf="hasSocialLinks()">
              <div class="block-title"><mat-icon>link</mat-icon> Enlaces</div>
              <div class="links-row">
                <a *ngIf="profile()?.github"   [href]="profile()!.github"   target="_blank" rel="noopener" class="link-btn github">
                  <mat-icon>code</mat-icon> GitHub
                </a>
                <a *ngIf="profile()?.linkedin" [href]="profile()!.linkedin" target="_blank" rel="noopener" class="link-btn linkedin">
                  <mat-icon>work</mat-icon> LinkedIn
                </a>
                <a *ngIf="profile()?.website"  [href]="profile()!.website"  target="_blank" rel="noopener" class="link-btn web">
                  <mat-icon>language</mat-icon> Web
                </a>
              </div>
            </div>

            <div class="info-block" *ngIf="profile()?.cvUrl">
              <div class="block-title"><mat-icon>description</mat-icon> Currículum</div>
              <a [href]="apiBase + profile()!.cvUrl" target="_blank" rel="noopener" class="cv-btn">
                <mat-icon>download</mat-icon> Descargar CV
              </a>
            </div>

            <div class="info-block" *ngIf="publicLinks().length">
              <div class="block-title"><mat-icon>link</mat-icon> Links</div>
              <div class="pub-links-list">
                <a *ngFor="let l of publicLinks()" [href]="l.url" target="_blank" rel="noopener" class="pub-link-item">
                  <div class="pub-link-left">
                    <mat-icon class="pub-link-icon">{{ linkIcon(l.type) }}</mat-icon>
                    <div class="pub-link-text">
                      <span class="pub-link-title">{{ l.previewTitle || l.title }}</span>
                      <span class="pub-link-url">{{ l.url }}</span>
                    </div>
                  </div>
                  <div class="pub-link-right">
                    <span *ngIf="l.projectName" class="pub-link-project">{{ l.projectName }}</span>
                    <mat-icon class="pub-link-arrow">open_in_new</mat-icon>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <!-- Formulario de contacto -->
          <div class="contact-section">
            <div class="block-title"><mat-icon>mail</mat-icon> Enviar mensaje</div>

            <div *ngIf="msgSent()" class="msg-success">
              <mat-icon>check_circle</mat-icon>
              ¡Mensaje enviado correctamente!
            </div>

            <form *ngIf="!msgSent()" class="msg-form" (ngSubmit)="sendMessage()">
              <div class="msg-row">
                <input [(ngModel)]="msgName" name="msgName" placeholder="Tu nombre *"
                       class="msg-input" required />
                <input [(ngModel)]="msgEmail" name="msgEmail" placeholder="Tu email *"
                       type="email" class="msg-input" required />
              </div>
              <textarea [(ngModel)]="msgBody" name="msgBody" placeholder="Tu mensaje *"
                        class="msg-input msg-textarea" rows="4" required></textarea>
              <div class="msg-footer">
                <span *ngIf="msgError()" class="msg-error">{{ msgError() }}</span>
                <button type="submit" class="msg-btn" [disabled]="msgSending()">
                  <mat-icon>send</mat-icon>
                  {{ msgSending() ? 'Enviando...' : 'Enviar mensaje' }}
                </button>
              </div>
            </form>
          </div>

          <button class="back-btn" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon> Volver
          </button>
        </div>

        <!-- PROYECTOS -->
        <div class="projects-area">
          <div class="projects-heading">
            <mat-icon>folder_special</mat-icon>
            <h2>Proyectos <span *ngIf="projects().length">({{ projects().length }})</span></h2>
          </div>

          <div class="projects-grid" *ngIf="projects().length">
            <div class="proj-card" *ngFor="let p of projects()" (click)="openProject(p)">
              <div class="proj-cover" [style.background]="p.coverStyle || 'linear-gradient(135deg,#667eea,#764ba2)'">
                <mat-icon class="proj-cover-icon">{{ p.coverIcon || 'folder' }}</mat-icon>
                <span class="status-badge" [class]="p.status">
                  {{ p.status === 'published' ? 'Publicado' : 'En desarrollo' }}
                </span>
              </div>
              <div class="proj-info">
                <div class="proj-top">
                  <span class="proj-name">{{ p.name }}</span>
                  <span class="cat-badge" *ngIf="p.categoryName" [style.background]="p.categoryColor || '#06b6d4'">
                    {{ p.categoryName }}
                  </span>
                </div>
                <p class="proj-desc" *ngIf="p.description">{{ p.description }}</p>
                <div class="proj-footer">
                  <span *ngIf="p.technologiesCount" class="meta-item">
                    <mat-icon>code</mat-icon>{{ p.technologiesCount }} tecn.
                  </span>
                  <span *ngIf="p.startDate" class="meta-item">
                    <mat-icon>calendar_today</mat-icon>{{ p.startDate | date:'MMM yyyy' }}
                  </span>
                  <span class="see-more">Ver más <mat-icon>chevron_right</mat-icon></span>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-projects" *ngIf="!projects().length && !loadingProjects()">
            <mat-icon>folder_open</mat-icon>
            <p>Aún no hay proyectos para mostrar</p>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="!loading() && !profile()" class="error-state">
        <mat-icon>error_outline</mat-icon>
        <h2>Perfil no encontrado</h2>
        <button class="back-btn" (click)="goBack()"><mat-icon>arrow_back</mat-icon> Volver</button>
      </div>

      <!-- PANEL DETALLE -->
      <div class="panel-overlay" *ngIf="selected()" (click)="closeProject()"></div>
      <div class="detail-panel" [class.open]="selected()">
        <ng-container *ngIf="selected() as proj">
          <div class="panel-cover" [style.background]="proj.coverStyle || 'linear-gradient(135deg,#667eea,#764ba2)'">
            <mat-icon class="panel-cover-icon">{{ proj.coverIcon || 'folder' }}</mat-icon>
            <button class="panel-close" (click)="closeProject()"><mat-icon>close</mat-icon></button>
          </div>

          <div class="panel-body">
            <div class="panel-title-row">
              <h2>{{ proj.name }}</h2>
              <span class="cat-badge" *ngIf="proj.categoryName" [style.background]="proj.categoryColor || '#06b6d4'">
                {{ proj.categoryName }}
              </span>
              <span class="status-badge" [class]="proj.status">
                {{ proj.status === 'published' ? 'Publicado' : 'En desarrollo' }}
              </span>
            </div>

            <p class="panel-desc" *ngIf="proj.description">{{ proj.description }}</p>

            <div class="panel-meta">
              <span *ngIf="proj.startDate"><mat-icon>calendar_today</mat-icon> {{ proj.startDate | date:'mediumDate' }}</span>
              <span *ngIf="proj.endDate"><mat-icon>event</mat-icon> {{ proj.endDate | date:'mediumDate' }}</span>
              <span *ngIf="proj.technologiesCount"><mat-icon>code</mat-icon> {{ proj.technologiesCount }} tecnologías</span>
            </div>

            <div class="panel-links" *ngIf="proj.liveUrl || proj.repoUrl">
              <a *ngIf="proj.liveUrl" [href]="proj.liveUrl" target="_blank" rel="noopener" class="link-btn web">
                <mat-icon>open_in_new</mat-icon> Demo en vivo
              </a>
              <a *ngIf="proj.repoUrl" [href]="proj.repoUrl" target="_blank" rel="noopener" class="link-btn github">
                <mat-icon>code</mat-icon> Repositorio
              </a>
            </div>

            <!-- Fotos -->
            <div class="panel-shots" *ngIf="selectedShots().length">
              <div class="shots-title"><mat-icon>photo_library</mat-icon> Capturas</div>
              <div class="shots-grid">
                <div class="shot-thumb" *ngFor="let s of selectedShots(); let i = index" (click)="openLightbox(i)">
                  <img [src]="apiBase + s.imageUrl" [alt]="s.caption" />
                  <span class="shot-caption" *ngIf="s.caption">{{ s.caption }}</span>
                </div>
              </div>
            </div>
            <div class="shots-loading" *ngIf="loadingShots()">
              <mat-spinner diameter="32"></mat-spinner>
            </div>
          </div>
        </ng-container>
      </div>

      <!-- LIGHTBOX -->
      <div class="lightbox" *ngIf="lightboxIndex() !== null" (click)="closeLightbox()">
        <button class="lb-prev" (click)="$event.stopPropagation(); lbMove(-1)"><mat-icon>chevron_left</mat-icon></button>
        <img [src]="apiBase + selectedShots()[lightboxIndex()!].imageUrl" (click)="$event.stopPropagation()" />
        <button class="lb-next" (click)="$event.stopPropagation(); lbMove(1)"><mat-icon>chevron_right</mat-icon></button>
        <button class="lb-close" (click)="closeLightbox()"><mat-icon>close</mat-icon></button>
      </div>

    </div>
  `,
  styles: `
    .page { min-height: 100vh; background: var(--app-bg, #0f1117); }

    .center-spin { display:flex; justify-content:center; align-items:center; min-height:60vh; }

    .layout { max-width: 960px; margin: 0 auto; padding: 32px 20px; display: flex; flex-direction: column; gap: 32px; }

    /* ── PERFIL ── */
    .profile-card {
      background: var(--app-surface, #1a1d27);
      border: 1px solid var(--app-border, #2a2d3a);
      border-radius: 16px;
      overflow: hidden;
    }
    .profile-header {
      display: flex; align-items: center; gap: 20px;
      padding: 28px 28px 20px;
      border-bottom: 1px solid var(--app-border, #2a2d3a);
    }
    .avatar {
      width: 72px; height: 72px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg,#667eea,#764ba2);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 36px;
    }
    .avatar mat-icon { font-size: 36px; width: 36px; height: 36px; }
    .profile-header h1 { margin: 0; font-size: 22px; font-weight: 700; color: var(--app-text-primary, #e2e8f0); }
    .updated { font-size: 12px; color: var(--app-text-muted, #64748b); }

    .profile-body { padding: 20px 28px; display: flex; flex-direction: column; gap: 20px; }

    .info-block {}
    .block-title {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; font-weight: 600; text-transform: uppercase;
      letter-spacing: .05em; color: #667eea; margin-bottom: 10px;
    }
    .block-title mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .bio { margin: 0; color: var(--app-text-muted, #94a3b8); line-height: 1.7; white-space: pre-wrap; }

    .skills-row { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-chip {
      padding: 5px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;
      background: linear-gradient(135deg,#667eea,#764ba2); color: white;
    }

    .links-row { display: flex; flex-wrap: wrap; gap: 10px; }
    .link-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 500;
      text-decoration: none; border: 1px solid transparent; transition: opacity .15s;
    }
    .link-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .link-btn:hover { opacity: .8; }
    .github  { background: #24292e; color: #fff; }
    .linkedin{ background: #0077b5; color: #fff; }
    .web     { background: #667eea; color: #fff; }

    .cv-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 600;
      background: linear-gradient(135deg,#667eea,#764ba2); color: white;
      text-decoration: none;
    }
    .cv-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }

    /* Contacto */
    .contact-section { padding: 20px 28px; border-top: 1px solid var(--app-border, #2a2d3a); }
    .msg-form { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
    .msg-row { display: flex; gap: 10px; }
    .msg-input {
      width: 100%; padding: 10px 14px; border-radius: 8px; font-size: 14px;
      background: var(--app-hover, #252836); border: 1px solid var(--app-border, #2a2d3a);
      color: var(--app-text-primary, #e2e8f0); outline: none; transition: border-color .15s;
      box-sizing: border-box;
    }
    .msg-input:focus { border-color: #667eea; }
    .msg-input::placeholder { color: var(--app-text-muted, #64748b); }
    .msg-textarea { resize: vertical; min-height: 90px; font-family: inherit; }
    .msg-footer { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
    .msg-error { font-size: 13px; color: #ff6b6b; }
    .msg-btn {
      display: flex; align-items: center; gap: 6px; padding: 9px 20px;
      border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 600;
      background: linear-gradient(135deg, #667eea, #764ba2); color: white;
      transition: opacity .15s;
    }
    .msg-btn:disabled { opacity: .6; cursor: not-allowed; }
    .msg-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .msg-success {
      display: flex; align-items: center; gap: 8px; padding: 12px 16px;
      border-radius: 8px; background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.3);
      color: #22c55e; font-size: 14px; font-weight: 500; margin-top: 12px;
    }

    /* Links públicos */
    .pub-links-list { display: flex; flex-direction: column; gap: 8px; }
    .pub-link-item {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding: 10px 14px; border-radius: 10px; text-decoration: none;
      background: var(--app-hover, #252836);
      border: 1px solid var(--app-border, #2a2d3a);
      transition: border-color .15s, background .15s;
    }
    .pub-link-item:hover { border-color: #667eea; background: rgba(102,126,234,.06); }
    .pub-link-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .pub-link-icon { font-size: 18px; width: 18px; height: 18px; color: #667eea; flex-shrink: 0; }
    .pub-link-text { display: flex; flex-direction: column; min-width: 0; }
    .pub-link-title { font-size: 13px; font-weight: 600; color: var(--app-text-primary, #e2e8f0); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pub-link-url { font-size: 11px; color: var(--app-text-muted, #64748b); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pub-link-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
    .pub-link-project { font-size: 10px; padding: 2px 7px; border-radius: 10px; background: var(--app-border, #2a2d3a); color: var(--app-text-muted, #94a3b8); }
    .pub-link-arrow { font-size: 14px; width: 14px; height: 14px; color: var(--app-text-muted, #64748b); }

    .back-btn {
      display: flex; align-items: center; gap: 6px; margin: 0 28px 20px;
      padding: 8px 20px; border-radius: 8px; border: 1px solid var(--app-border, #2a2d3a);
      background: transparent; color: var(--app-text-muted, #94a3b8);
      font-size: 14px; cursor: pointer; width: fit-content; transition: background .15s;
    }
    .back-btn:hover { background: var(--app-hover, #252836); }
    .back-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* ── PROYECTOS ── */
    .projects-area {}
    .projects-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
    .projects-heading mat-icon { color: #667eea; font-size: 22px; width: 22px; height: 22px; }
    .projects-heading h2 { margin: 0; font-size: 20px; font-weight: 700; color: var(--app-text-primary, #e2e8f0); }
    .projects-heading h2 span { color: #667eea; }

    .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap: 20px; }

    .proj-card {
      background: var(--app-surface, #1a1d27);
      border: 1px solid var(--app-border, #2a2d3a);
      border-radius: 14px; overflow: hidden; cursor: pointer;
      transition: transform .2s, box-shadow .2s, border-color .2s;
      display: flex; flex-direction: column;
    }
    .proj-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(102,126,234,.2);
      border-color: #667eea;
    }

    .proj-cover {
      height: 120px; display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .proj-cover-icon { font-size: 48px; width: 48px; height: 48px; color: rgba(255,255,255,.8); }

    .status-badge {
      position: absolute; top: 10px; right: 10px;
      font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px;
    }
    .status-badge.published   { background: rgba(34,197,94,.2);  color: #22c55e; }
    .status-badge.in_progress { background: rgba(234,179,8,.2);  color: #eab308; }

    .proj-info { padding: 14px 16px; flex: 1; display: flex; flex-direction: column; gap: 8px; }

    .proj-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; }
    .proj-name { font-size: 15px; font-weight: 700; color: var(--app-text-primary, #e2e8f0); }

    .cat-badge {
      font-size: 10px; padding: 2px 8px; border-radius: 10px;
      color: white; white-space: nowrap; flex-shrink: 0;
    }

    .proj-desc {
      margin: 0; font-size: 13px; color: var(--app-text-muted, #94a3b8); line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }

    .proj-footer {
      display: flex; align-items: center; gap: 12px; margin-top: auto;
      font-size: 12px; color: var(--app-text-muted, #64748b);
    }
    .meta-item { display: flex; align-items: center; gap: 3px; }
    .meta-item mat-icon { font-size: 13px; width: 13px; height: 13px; }
    .see-more { margin-left: auto; color: #667eea; font-weight: 600; display: flex; align-items: center; }
    .see-more mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .empty-projects { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 48px 0; color: var(--app-text-muted, #64748b); }
    .empty-projects mat-icon { font-size: 48px; width: 48px; height: 48px; }

    /* ── ERROR ── */
    .error-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 80px 0; color: var(--app-text-muted,#94a3b8); }
    .error-state mat-icon { font-size: 64px; width: 64px; height: 64px; color: #ff6b6b; }

    /* ── PANEL DETALLE ── */
    .panel-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 100;
      animation: fadeIn .2s ease;
    }
    .detail-panel {
      position: fixed; top: 0; right: -540px; width: 520px; max-width: 95vw;
      height: 100vh; background: var(--app-surface, #1a1d27);
      border-left: 1px solid var(--app-border, #2a2d3a);
      z-index: 101; overflow-y: auto; transition: right .3s cubic-bezier(.4,0,.2,1);
    }
    .detail-panel.open { right: 0; }

    .panel-cover {
      height: 160px; display: flex; align-items: center; justify-content: center;
      position: relative; flex-shrink: 0;
    }
    .panel-cover-icon { font-size: 64px; width: 64px; height: 64px; color: rgba(255,255,255,.8); }
    .panel-close {
      position: absolute; top: 12px; right: 12px;
      background: rgba(0,0,0,.3); border: none; border-radius: 50%;
      width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
      color: white; cursor: pointer;
    }
    .panel-close mat-icon { font-size: 20px; width: 20px; height: 20px; }

    .panel-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }

    .panel-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .panel-title-row h2 { margin: 0; font-size: 20px; font-weight: 700; color: var(--app-text-primary,#e2e8f0); flex: 1; }

    .panel-desc { margin: 0; color: var(--app-text-muted,#94a3b8); line-height: 1.7; white-space: pre-wrap; }

    .panel-meta { display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; color: var(--app-text-muted,#94a3b8); }
    .panel-meta span { display: flex; align-items: center; gap: 5px; }
    .panel-meta mat-icon { font-size: 15px; width: 15px; height: 15px; color: #667eea; }

    .panel-links { display: flex; flex-wrap: wrap; gap: 10px; }

    .shots-title {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; font-weight: 600; text-transform: uppercase;
      letter-spacing: .05em; color: #667eea; margin-bottom: 12px;
    }
    .shots-title mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .shots-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .shot-thumb {
      border-radius: 8px; overflow: hidden; cursor: pointer;
      border: 1px solid var(--app-border, #2a2d3a);
      transition: transform .15s;
    }
    .shot-thumb:hover { transform: scale(1.02); }
    .shot-thumb img { width: 100%; height: 120px; object-fit: cover; display: block; }
    .shot-caption { display: block; padding: 4px 8px; font-size: 11px; color: var(--app-text-muted,#64748b); }

    .shots-loading { display: flex; justify-content: center; padding: 20px 0; }

    /* ── LIGHTBOX ── */
    .lightbox {
      position: fixed; inset: 0; background: rgba(0,0,0,.92); z-index: 200;
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn .15s ease;
    }
    .lightbox img { max-width: 90vw; max-height: 85vh; border-radius: 8px; object-fit: contain; }
    .lb-prev, .lb-next, .lb-close {
      position: fixed; background: rgba(255,255,255,.1); border: none; border-radius: 50%;
      width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
      color: white; cursor: pointer; transition: background .15s;
    }
    .lb-prev:hover, .lb-next:hover, .lb-close:hover { background: rgba(255,255,255,.25); }
    .lb-prev  { left: 16px;  top: 50%; transform: translateY(-50%); }
    .lb-next  { right: 16px; top: 50%; transform: translateY(-50%); }
    .lb-close { top: 16px; right: 16px; }
    .lb-prev mat-icon, .lb-next mat-icon, .lb-close mat-icon { font-size: 22px; width: 22px; height: 22px; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `,
})
export class PublicProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ProfileService);
  private readonly http = inject(HttpClient);

  readonly apiBase = environment.apiUrl.replace('/api', '');

  loading = signal(true);
  loadingProjects = signal(true);
  loadingShots = signal(false);

  profile = signal<Profile | null>(null);
  projects = signal<Project[]>([]);
  publicLinks = signal<Link[]>([]);
  selected = signal<Project | null>(null);
  selectedShots = signal<Screenshot[]>([]);
  lightboxIndex = signal<number | null>(null);

  private userId = 0;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('userId');
    if (id) {
      this.userId = Number(id);
      this.loadProfile(this.userId);
      this.loadProjects(this.userId);
      this.loadPublicLinks(this.userId);
    }
  }

  private loadProfile(userId: number) {
    this.service.getPublic(userId).subscribe({
      next: (r) => { this.profile.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private loadProjects(userId: number) {
    this.http.get<{ success: boolean; data: Project[] }>(`${environment.apiUrl}/projects/public/${userId}`)
      .subscribe({
        next: (r) => { this.projects.set(r.data); this.loadingProjects.set(false); },
        error: () => this.loadingProjects.set(false),
      });
  }

  // Mensaje
  msgName = '';
  msgEmail = '';
  msgBody = '';
  msgSending = signal(false);
  msgSent = signal(false);
  msgError = signal<string | null>(null);

  sendMessage() {
    if (!this.msgName || !this.msgEmail || !this.msgBody) return;
    this.msgSending.set(true);
    this.msgError.set(null);
    this.http.post(`${environment.apiUrl}/contact/send/${this.userId}`, {
      fromName: this.msgName,
      fromEmail: this.msgEmail,
      body: this.msgBody,
    }).subscribe({
      next: () => {
        this.msgSent.set(true);
        this.msgSending.set(false);
      },
      error: (e) => {
        this.msgError.set(e.error?.message ?? 'Error al enviar el mensaje');
        this.msgSending.set(false);
      },
    });
  }

  private loadPublicLinks(userId: number) {
    this.http.get<{ success: boolean; data: Link[] }>(`${environment.apiUrl}/links/public/${userId}`)
      .subscribe({ next: (r) => this.publicLinks.set(r.data), error: () => {} });
  }

  linkIcon(type: string): string {
    const icons: Record<string, string> = {
      repo: 'code', demo: 'open_in_new', article: 'article',
      video: 'play_circle', docs: 'description', certificate: 'workspace_premium', other: 'link',
    };
    return icons[type] ?? 'link';
  }

  openProject(p: Project) {
    this.selected.set(p);
    this.selectedShots.set([]);
    this.loadingShots.set(true);
    this.http.get<{ success: boolean; data: Screenshot[] }>(
      `${environment.apiUrl}/projects/public/${this.userId}/${p.id}/screenshots`
    ).subscribe({
      next: (r) => { this.selectedShots.set(r.data); this.loadingShots.set(false); },
      error: () => this.loadingShots.set(false),
    });
  }

  closeProject() {
    this.selected.set(null);
    this.selectedShots.set([]);
    this.lightboxIndex.set(null);
  }

  openLightbox(i: number) { this.lightboxIndex.set(i); }
  closeLightbox() { this.lightboxIndex.set(null); }
  lbMove(dir: number) {
    const len = this.selectedShots().length;
    this.lightboxIndex.set((this.lightboxIndex()! + dir + len) % len);
  }

  getSkills(): string[] {
    return (this.profile()?.skills ?? '').split(',').map(s => s.trim()).filter(Boolean);
  }

  hasSocialLinks(): boolean {
    const p = this.profile();
    return !!(p?.github || p?.linkedin || p?.website);
  }

  goBack() { this.router.navigate(['/']); }
}
