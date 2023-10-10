import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { ZvFormFieldModule } from '@zvoove/components/form-field';
import { ComponentPageContentDirective } from './component-page-wrapper/component-page-content.directive';
import { AppComponentPageWrapper } from './component-page-wrapper/component-page-wrapper.component';
import { FormControlDemoCard } from './form-control-card/form-control-demo-card.component';

export const materialImports = [MatCardModule, MatButtonModule, MatCheckboxModule, MatInputModule];

export const componentPageImports = [AppComponentPageWrapper, ComponentPageContentDirective];

export const formsImports = [FormsModule, ReactiveFormsModule, ZvFormFieldModule];

export const formControlComponentPageImports = [...formsImports, ...componentPageImports, FormControlDemoCard];

export const allSharedImports = [...materialImports, ...formControlComponentPageImports];
