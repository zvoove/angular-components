import { DirEntry, FileEntry, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

const touchedFiles: string[] = [];

export default (): Rule => (tree: Tree, context: SchematicContext) => {
  const title = 'components: replace [prosoft] with [zvoove]';
  context.logger.info(`"${title}" started...`);
  traverseDirectory(tree.root, tree, context);
  if (touchedFiles.length) {
    context.logger.info(`Modified files: ${touchedFiles.join(', ')}`);
  } else {
    context.logger.info('No modifications required.');
  }
  context.logger.info(`"${title}" finished.`);
  return tree;
};

function traverseDirectory(directory: DirEntry, tree: Tree, _context: SchematicContext) {
  const dirPath = directory.path;
  if (dirPath.endsWith('/dist') || dirPath.endsWith('/node_modules')) {
    // Skip these directories
    return;
  }
  for (const subDir of directory.subdirs) {
    traverseDirectory(directory.dir(subDir), tree, _context);
  }

  for (const fileName of directory.subfiles.filter((subFile) => subFile.endsWith('.html'))) {
    const file = directory.file(fileName);
    if (file) {
      updateHtmlFile(file, tree, _context);
    }
  }

  for (const fileName of directory.subfiles.filter((subFile) => subFile.endsWith('.css') || subFile.endsWith('.scss'))) {
    const file = directory.file(fileName);
    if (file) {
      updateCssFile(file, tree, _context);
    }
  }

  for (const fileName of directory.subfiles.filter((subFile) => subFile.endsWith('.ts'))) {
    const file = directory.file(fileName);
    if (file) {
      updateTsFile(file, tree, _context);
    }
  }
}
function updateCssFile(file: FileEntry, tree: Tree, _context: SchematicContext) {
  let content = file.content.toString();

  if (content.indexOf('--ps-') !== -1) {
    content = content.replace(/--ps-/g, '--zv-');
  }
  if (content.indexOf('ps-block-ui') !== -1) {
    content = content.replace(/ps-block-ui/g, 'zv-block-ui');
  }
  if (content.indexOf('ps-card') !== -1) {
    content = content.replace(/ps-card/g, 'zv-card');
  }
  if (content.indexOf('ps-dialog-wrapper') !== -1) {
    content = content.replace(/ps-dialog-wrapper/g, 'zv-dialog-wrapper');
  }
  if (content.indexOf('ps-flip-container') !== -1) {
    content = content.replace(/ps-flip-container/g, 'zv-flip-container');
  }
  if (content.indexOf('ps-form') !== -1) {
    content = content.replace(/ps-form/g, 'zv-form');
  }
  if (content.indexOf('ps-header') !== -1) {
    content = content.replace(/ps-header/g, 'zv-header');
  }
  if (content.indexOf('ps-number-input') !== -1) {
    content = content.replace(/ps-number-input/g, 'zv-number-input');
  }
  if (content.indexOf('ps-savebar') !== -1) {
    content = content.replace(/ps-savebar/g, 'zv-savebar');
  }
  if (content.indexOf('ps-select') !== -1) {
    content = content.replace(/ps-select/g, 'zv-select');
  }
  if (content.indexOf('ps-slider') !== -1) {
    content = content.replace(/ps-slider/g, 'zv-slider');
  }
  if (content.indexOf('ps-table') !== -1) {
    content = content.replace(/ps-table/g, 'zv-table');
  }
  if (content.indexOf('ps-view') !== -1) {
    content = content.replace(/ps-view/g, 'zv-view');
  }

  tree.overwrite(file.path, content);
  touchedFiles.push(file.path);
}

function updateHtmlFile(file: FileEntry, tree: Tree, _context: SchematicContext) {
  let content = file.content.toString();

  if (content.indexOf('ps-block-ui') !== -1) {
    content = content.replace(/ps-block-ui/g, 'zv-block-ui');
  }

  if (content.indexOf('ps-card') !== -1) {
    content = content.replace(/ps-card/g, 'zv-card');
  }
  if (content.indexOf('psCardTopButtonSection') !== -1) {
    content = content.replace(/psCardTopButtonSection/g, 'zvCardTopButtonSection');
  }
  if (content.indexOf('psCardFooterSection') !== -1) {
    content = content.replace(/psCardFooterSection/g, 'zvCardFooterSection');
  }
  if (content.indexOf('psCardCaptionSection') !== -1) {
    content = content.replace(/psCardCaptionSection/g, 'zvCardCaptionSection');
  }
  if (content.indexOf('psCardDescriptionSection') !== -1) {
    content = content.replace(/psCardDescriptionSection/g, 'zvCardDescriptionSection');
  }
  if (content.indexOf('psCardActionsSection') !== -1) {
    content = content.replace(/psCardActionsSection/g, 'zvCardActionsSection');
  }

  if (content.indexOf('ps-dialog-wrapper') !== -1) {
    content = content.replace(/ps-dialog-wrapper/g, 'zv-dialog-wrapper');
  }

  if (content.indexOf('ps-flip-container') !== -1) {
    content = content.replace(/ps-flip-container/g, 'zv-flip-container');
  }
  if (content.indexOf('psFlipContainerFront') !== -1) {
    content = content.replace(/psFlipContainerFront/g, 'zvFlipContainerFront');
  }
  if (content.indexOf('psFlipContainerBack') !== -1) {
    content = content.replace(/psFlipContainerBack/g, 'zvFlipContainerBack');
  }

  if (content.indexOf('ps-form') !== -1) {
    content = content.replace(/ps-form/g, 'zv-form');
  }
  if (content.indexOf('psFormSavebarButtons') !== -1) {
    content = content.replace(/psFormSavebarButtons/g, 'zvFormSavebarButtons');
  }

  if (content.indexOf('ps-header') !== -1) {
    content = content.replace(/ps-header/g, 'zv-header');
  }
  if (content.indexOf('psHeaderTopButtonSection') !== -1) {
    content = content.replace(/psHeaderTopButtonSection/g, 'zvHeaderTopButtonSection');
  }
  if (content.indexOf('psHeaderCaptionSection') !== -1) {
    content = content.replace(/psHeaderCaptionSection/g, 'zvHeaderCaptionSection');
  }
  if (content.indexOf('psHeaderDescriptionSection') !== -1) {
    content = content.replace(/psHeaderDescriptionSection/g, 'zvHeaderDescriptionSection');
  }

  if (content.indexOf('ps-number-input') !== -1) {
    content = content.replace(/ps-number-input/g, 'zv-number-input');
  }

  if (content.indexOf('ps-savebar') !== -1) {
    content = content.replace(/ps-savebar/g, 'zv-savebar');
  }
  if (content.indexOf('psSavebarRightContent') !== -1) {
    content = content.replace(/psSavebarRightContent/g, 'zvSavebarRightContent');
  }

  if (content.indexOf('ps-select') !== -1) {
    content = content.replace(/ps-select/g, 'zv-select');
  }
  if (content.indexOf('psSelectOptionTemplate') !== -1) {
    content = content.replace(/psSelectOptionTemplate/g, 'zvSelectOptionTemplate');
  }
  if (content.indexOf('psSelectTriggerTemplate') !== -1) {
    content = content.replace(/psSelectTriggerTemplate/g, 'zvSelectTriggerTemplate');
  }

  if (content.indexOf('ps-slider') !== -1) {
    content = content.replace(/ps-slider/g, 'zv-slider');
  }

  if (content.indexOf('ps-table') !== -1) {
    content = content.replace(/ps-table/g, 'zv-table');
  }
  if (content.indexOf('psTableActionsToRender') !== -1) {
    content = content.replace(/psTableActionsToRender/g, 'zvTableActionsToRender');
  }
  if (content.indexOf('psTableActionType') !== -1) {
    content = content.replace(/psTableActionType/g, 'zvTableActionType');
  }
  if (content.indexOf('psTableColumnTemplate') !== -1) {
    content = content.replace(/psTableColumnTemplate/g, 'zvTableColumnTemplate');
  }
  if (content.indexOf('psTableColumnHeaderTemplate') !== -1) {
    content = content.replace(/psTableColumnHeaderTemplate/g, 'zvTableColumnHeaderTemplate');
  }
  if (content.indexOf('psTableTopButtonSection') !== -1) {
    content = content.replace(/psTableTopButtonSection/g, 'zvTableTopButtonSection');
  }
  if (content.indexOf('psTableListActions') !== -1) {
    content = content.replace(/psTableListActions/g, 'zvTableListActions');
  }
  if (content.indexOf('psTableRowActions') !== -1) {
    content = content.replace(/psTableRowActions/g, 'zvTableRowActions');
  }
  if (content.indexOf('psTableCustomHeader') !== -1) {
    content = content.replace(/psTableCustomHeader/g, 'zvTableCustomHeader');
  }
  if (content.indexOf('psTableCustomSettings') !== -1) {
    content = content.replace(/psTableCustomSettings/g, 'zvTableCustomSettings');
  }
  if (content.indexOf('psTableRowDetailTemplate') !== -1) {
    content = content.replace(/psTableRowDetailTemplate/g, 'zvTableRowDetailTemplate');
  }

  if (content.indexOf('ps-view') !== -1) {
    content = content.replace(/ps-view/g, 'zv-view');
  }

  if (content.indexOf('psErrorMessage') !== -1) {
    content = content.replace(/psErrorMessage/g, 'zvErrorMessage');
  }
  if (content.indexOf('psTableActionsToRender') !== -1) {
    content = content.replace(/psTableActionsToRender/g, 'zvTableActionsToRender');
  }
  if (content.indexOf('psTableActionType') !== -1) {
    content = content.replace(/psTableActionType/g, 'zvTableActionType');
  }

  if (content.indexOf('--ps-') !== -1) {
    content = content.replace(/--ps-/g, '--zv-');
  }
  tree.overwrite(file.path, content);
  touchedFiles.push(file.path);
}

function updateTsFile(file: FileEntry, tree: Tree, _context: SchematicContext) {
  let content = file.content.toString();
  const containsComponent = content.match(/\@Component\(\{[\r\n\W\w]*/);
  if (containsComponent) {
    let component = containsComponent[0];
    content = content.replace(/\@Component\(\{[\r\n\W\w]*/, '');
    if (component.indexOf('ps-block-ui') !== -1) {
      component = component.replace(/ps-block-ui/g, 'zv-block-ui');
    }
    if (component.indexOf('ps-card') !== -1) {
      component = component.replace(/ps-card/g, 'zv-card');
    }
    if (component.indexOf('ps-dialog-wrapper') !== -1) {
      component = component.replace(/ps-dialog-wrapper/g, 'zv-dialog-wrapper');
    }
    if (component.indexOf('ps-flip-container') !== -1) {
      component = component.replace(/ps-flip-container/g, 'zv-flip-container');
    }
    if (component.indexOf('ps-form') !== -1) {
      component = component.replace(/ps-form/g, 'zv-form');
    }
    if (component.indexOf('ps-header') !== -1) {
      component = component.replace(/ps-header/g, 'zv-header');
    }
    if (component.indexOf('ps-number-input') !== -1) {
      component = component.replace(/ps-number-input/g, 'zv-number-input');
    }
    if (component.indexOf('ps-savebar') !== -1) {
      component = component.replace(/ps-savebar/g, 'zv-savebar');
    }
    if (component.indexOf('ps-select') !== -1) {
      component = component.replace(/ps-select/g, 'zv-select');
    }
    if (component.indexOf('ps-slider') !== -1) {
      component = component.replace(/ps-slider/g, 'zv-slider');
    }
    if (component.indexOf('ps-table') !== -1) {
      component = component.replace(/ps-table/g, 'zv-table');
    }
    if (component.indexOf('ps-view') !== -1) {
      component = component.replace(/ps-view/g, 'zv-view');
    }

    if (content.indexOf('psErrorMessage') !== -1) {
      content = content.replace(/psErrorMessage/g, 'zvErrorMessage');
    }
    if (content.indexOf('psTableActionsToRender') !== -1) {
      content = content.replace(/psTableActionsToRender/g, 'zvTableActionsToRender');
    }
    if (content.indexOf('psTableActionType') !== -1) {
      content = content.replace(/psTableActionType/g, 'zvTableActionType');
    }
    content += component;
  }
  if (content.indexOf('--ps-') !== -1) {
    content = content.replace(/--ps-/g, '--zv-');
  }

  if (content.indexOf('IPsFormButton') !== -1) {
    content = content.replace(/IPsFormButton/g, 'IZvButton');
  }
  if (content.indexOf('IPsFormException') !== -1) {
    content = content.replace(/IPsFormException/g, 'IZvException');
  }

  if (content.indexOf('@prosoft/components/savebar') !== -1) {
    content = content.replace(/@prosoft\/components\/savebar/g, '@zvoove/components/form');
  }
  if (content.indexOf('@prosoft/components') !== -1) {
    content = content.replace(/@prosoft\/components/g, '@zvoove/components');
  }

  if (content.indexOf('PsBlockUiComponent') !== -1) {
    content = content.replace(/PsBlockUiComponent/g, 'ZvBlockUiComponent');
  }
  if (content.indexOf('PsBlockUiModule') !== -1) {
    content = content.replace(/PsBlockUiModule/g, 'ZvBlockUiModule');
  }

  if (content.indexOf('PsCardComponent') !== -1) {
    content = content.replace(/PsCardComponent/g, 'ZvCardComponent');
  }
  if (content.indexOf('PsCardModule') !== -1) {
    content = content.replace(/PsCardModule/g, 'ZvCardModule');
  }
  if (content.indexOf('PsCardTopButtonSectionDirective') !== -1) {
    content = content.replace(/PsCardTopButtonSectionDirective/g, 'ZvCardTopButtonSectionDirective');
  }
  if (content.indexOf('PsCardCaptionSectionDirective') !== -1) {
    content = content.replace(/PsCardCaptionSectionDirective/g, 'ZvCardCaptionSectionDirective');
  }
  if (content.indexOf('PsCardDescriptionSectionDirective') !== -1) {
    content = content.replace(/PsCardDescriptionSectionDirective/g, 'ZvCardDescriptionSectionDirective');
  }
  if (content.indexOf('PsCardFooterSectionDirective') !== -1) {
    content = content.replace(/PsCardFooterSectionDirective/g, 'ZvCardFooterSectionDirective');
  }
  if (content.indexOf('PsCardActionsSectionDirective') !== -1) {
    content = content.replace(/PsCardActionsSectionDirective/g, 'ZvCardActionsSectionDirective');
  }

  if (content.indexOf('IPsButton') !== -1) {
    content = content.replace(/IPsButton/g, 'IZvButton');
  }
  if (content.indexOf('PsErrorMessagePipe') !== -1) {
    content = content.replace(/PsErrorMessagePipe/g, 'ZvErrorMessagePipe');
  }
  if (content.indexOf('IPsException') !== -1) {
    content = content.replace(/IPsException/g, 'IZvException');
  }
  if (content.indexOf('PsExceptionMessageExtractor') !== -1) {
    content = content.replace(/PsExceptionMessageExtractor/g, 'ZvExceptionMessageExtractor');
  }
  if (content.indexOf('IPsSavebarIntlTexts') !== -1) {
    content = content.replace(/IPsSavebarIntlTexts/g, 'IZvSavebarIntlTexts');
  }
  if (content.indexOf('IPsTableIntlTexts') !== -1) {
    content = content.replace(/IPsTableIntlTexts/g, 'IZvTableIntlTexts');
  }
  if (content.indexOf('PsIntlKeys') !== -1) {
    content = content.replace(/PsIntlKeys/g, 'ZvIntlKeys');
  }
  if (content.indexOf('PsIntlService') !== -1) {
    content = content.replace(/PsIntlService/g, 'ZvIntlService');
  }
  if (content.indexOf('psErrorMessage') !== -1) {
    content = content.replace(/psErrorMessage/g, 'zvErrorMessage');
  }

  if (content.indexOf('PsDialogWrapperComponent') !== -1) {
    content = content.replace(/PsDialogWrapperComponent/g, 'ZvDialogWrapperComponent');
  }
  if (content.indexOf('IPsDialogWrapperDataSource') !== -1) {
    content = content.replace(/IPsDialogWrapperDataSource/g, 'IZvDialogWrapperDataSource');
  }
  if (content.indexOf('PsDialogWrapperModule') !== -1) {
    content = content.replace(/PsDialogWrapperModule/g, 'ZvDialogWrapperModule');
  }

  if (content.indexOf('PsFlipContainerModule') !== -1) {
    content = content.replace(/PsFlipContainerModule/g, 'ZvFlipContainerModule');
  }
  if (content.indexOf('PsFlipContainerComponent') !== -1) {
    content = content.replace(/PsFlipContainerComponent/g, 'ZvFlipContainerComponent');
  }

  if (content.indexOf('PsFormComponent') !== -1) {
    content = content.replace(/PsFormComponent/g, 'ZvFormComponent');
  }
  if (content.indexOf('PsFormModule') !== -1) {
    content = content.replace(/PsFormModule/g, 'ZvFormModule');
  }
  if (content.indexOf('IPsFormDataSource') !== -1) {
    content = content.replace(/IPsFormDataSource/g, 'IZvFormDataSource');
  }
  if (content.indexOf('IPsFormButton') !== -1) {
    content = content.replace(/IPsFormButton/g, 'IZvFormButton');
  }
  if (content.indexOf('IPsFormException') !== -1) {
    content = content.replace(/IPsFormException/g, 'IZvFormException');
  }
  if (content.indexOf('PsFormBaseModule') !== -1) {
    content = content.replace(/PsFormBaseModule/g, 'ZvFormBaseModule');
  }
  if (content.indexOf('PsFormService') !== -1) {
    content = content.replace(/PsFormService/g, 'ZvFormService');
  }
  if (content.indexOf('IPsFormError') !== -1) {
    content = content.replace(/IPsFormError/g, 'IZvFormError');
  }
  if (content.indexOf('PsFormErrorsComponent') !== -1) {
    content = content.replace(/PsFormErrorsComponent/g, 'ZvFormErrorsComponent');
  }
  if (content.indexOf('PsFormErrorsModule') !== -1) {
    content = content.replace(/PsFormErrorsModule/g, 'ZvFormErrorsModule');
  }

  if (content.indexOf('PsFormFieldComponent') !== -1) {
    content = content.replace(/PsFormFieldComponent/g, 'ZvFormFieldComponent');
  }
  if (content.indexOf('PsFormFieldModule') !== -1) {
    content = content.replace(/PsFormFieldModule/g, 'ZvFormFieldModule');
  }
  if (content.indexOf('PsFormFieldSubscriptType') !== -1) {
    content = content.replace(/PsFormFieldSubscriptType/g, 'ZvFormFieldSubscriptType');
  }
  if (content.indexOf('PS_FORM_FIELD_CONFIG') !== -1) {
    content = content.replace(/PS_FORM_FIELD_CONFIG/g, 'ZV_FORM_FIELD_CONFIG');
  }
  if (content.indexOf('PsFormFieldConfig') !== -1) {
    content = content.replace(/PsFormFieldConfig/g, 'ZvFormFieldConfig');
  }

  if (content.indexOf('PsHeaderComponent') !== -1) {
    content = content.replace(/PsHeaderComponent/g, 'ZvHeaderComponent');
  }
  if (content.indexOf('PsHeaderModule') !== -1) {
    content = content.replace(/PsHeaderModule/g, 'ZvHeaderModule');
  }
  if (content.indexOf('PsHeaderCaptionSectionDirective') !== -1) {
    content = content.replace(/PsHeaderCaptionSectionDirective/g, 'ZvHeaderCaptionSectionDirective');
  }
  if (content.indexOf('PsHeaderDescriptionSectionDirective') !== -1) {
    content = content.replace(/PsHeaderDescriptionSectionDirective/g, 'ZvHeaderDescriptionSectionDirective');
  }
  if (content.indexOf('PsHeaderTopButtonSectionDirective') !== -1) {
    content = content.replace(/PsHeaderTopButtonSectionDirective/g, 'ZvHeaderTopButtonSectionDirective');
  }

  if (content.indexOf('PsNumberInputComponent') !== -1) {
    content = content.replace(/PsNumberInputComponent/g, 'ZvNumberInputComponent');
  }
  if (content.indexOf('PsNumberInputModule') !== -1) {
    content = content.replace(/PsNumberInputModule/g, 'ZvNumberInputModule');
  }

  if (content.indexOf('PsSavebarRightContentDirective') !== -1) {
    content = content.replace(/PsSavebarRightContentDirective/g, 'ZvSavebarRightContentDirective');
  }
  if (content.indexOf('PsSavebarComponent') !== -1) {
    content = content.replace(/PsSavebarComponent/g, 'ZvSavebarComponent');
  }
  if (content.indexOf('PsSavebarModule') !== -1) {
    content = content.replace(/PsSavebarModule/g, 'ZvSavebarModule');
  }
  if (content.indexOf('IPsSavebarMode') !== -1) {
    content = content.replace(/IPsSavebarMode/g, 'IZvSavebarMode');
  }

  if (content.indexOf('PsSelectComponent') !== -1) {
    content = content.replace(/PsSelectComponent/g, 'ZvSelectComponent');
  }
  if (content.indexOf('PsSelectItem') !== -1) {
    content = content.replace(/PsSelectItem/g, 'ZvSelectItem');
  }
  if (content.indexOf('PsSelectModule') !== -1) {
    content = content.replace(/PsSelectModule/g, 'ZvSelectModule');
  }
  if (content.indexOf('PsSelectService') !== -1) {
    content = content.replace(/PsSelectService/g, 'ZvSelectService');
  }
  if (content.indexOf('PsSelectLoadTrigger') !== -1) {
    content = content.replace(/PsSelectLoadTrigger/g, 'ZvSelectLoadTrigger');
  }
  if (content.indexOf('PsSelectSortBy') !== -1) {
    content = content.replace(/PsSelectSortBy/g, 'ZvSelectSortBy');
  }
  if (content.indexOf('isPsSelectOptionsData') !== -1) {
    content = content.replace(/isPsSelectOptionsData/g, 'isZvSelectOptionsData');
  }
  if (content.indexOf('PsSelectData') !== -1) {
    content = content.replace(/PsSelectData/g, 'ZvSelectData');
  }
  if (content.indexOf('PsSelectOptionTemplateDirective') !== -1) {
    content = content.replace(/PsSelectOptionTemplateDirective/g, 'ZvSelectOptionTemplateDirective');
  }
  if (content.indexOf('PsSelectTriggerTemplateDirective') !== -1) {
    content = content.replace(/PsSelectTriggerTemplateDirective/g, 'ZvSelectTriggerTemplateDirective');
  }

  if (content.indexOf('PsSliderComponent') !== -1) {
    content = content.replace(/PsSliderComponent/g, 'ZvSliderComponent');
  }
  if (content.indexOf('PsSliderModule') !== -1) {
    content = content.replace(/PsSliderModule/g, 'ZvSliderModule');
  }

  if (content.indexOf('IPsTableIntlTexts') !== -1) {
    content = content.replace(/IPsTableIntlTexts/g, 'IZvTableIntlTexts');
  }
  if (content.indexOf('IPsTableFilterResult') !== -1) {
    content = content.replace(/IPsTableFilterResult/g, 'IZvTableFilterResult');
  }
  if (content.indexOf('PsTableDataSource') !== -1) {
    content = content.replace(/PsTableDataSource/g, 'ZvTableDataSource');
  }
  if (content.indexOf('PsTableColumnDirective') !== -1) {
    content = content.replace(/PsTableColumnDirective/g, 'ZvTableColumnDirective');
  }
  if (content.indexOf('PsTableColumnHeaderTemplateDirective') !== -1) {
    content = content.replace(/PsTableColumnHeaderTemplateDirective/g, 'ZvTableColumnHeaderTemplateDirective');
  }
  if (content.indexOf('PsTableColumnTemplateDirective') !== -1) {
    content = content.replace(/PsTableColumnTemplateDirective/g, 'ZvTableColumnTemplateDirective');
  }
  if (content.indexOf('PsTableCustomHeaderDirective') !== -1) {
    content = content.replace(/PsTableCustomHeaderDirective/g, 'ZvTableCustomHeaderDirective');
  }
  if (content.indexOf('PsTableCustomSettingsDirective') !== -1) {
    content = content.replace(/PsTableCustomSettingsDirective/g, 'ZvTableCustomSettingsDirective');
  }
  if (content.indexOf('PsTableListActionsDirective') !== -1) {
    content = content.replace(/PsTableListActionsDirective/g, 'ZvTableListActionsDirective');
  }
  if (content.indexOf('PsTableRowActionsDirective') !== -1) {
    content = content.replace(/PsTableRowActionsDirective/g, 'ZvTableRowActionsDirective');
  }
  if (content.indexOf('PsTableRowDetailDirective') !== -1) {
    content = content.replace(/PsTableRowDetailDirective/g, 'ZvTableRowDetailDirective');
  }
  if (content.indexOf('PsTableRowDetailTemplateDirective') !== -1) {
    content = content.replace(/PsTableRowDetailTemplateDirective/g, 'ZvTableRowDetailTemplateDirective');
  }
  if (content.indexOf('PsTableTopButtonSectionDirective') !== -1) {
    content = content.replace(/PsTableTopButtonSectionDirective/g, 'ZvTableTopButtonSectionDirective');
  }
  if (content.indexOf('PsTableMemoryStateManager') !== -1) {
    content = content.replace(/PsTableMemoryStateManager/g, 'ZvTableMemoryStateManager');
  }
  if (content.indexOf('PsTableStateManager') !== -1) {
    content = content.replace(/PsTableStateManager/g, 'ZvTableStateManager');
  }
  if (content.indexOf('PsTableUrlStateManager') !== -1) {
    content = content.replace(/PsTableUrlStateManager/g, 'ZvTableUrlStateManager');
  }
  if (content.indexOf('IExtendedPsTableUpdateDataInfo') !== -1) {
    content = content.replace(/IExtendedPsTableUpdateDataInfo/g, 'IExtendedZvTableUpdateDataInfo');
  }
  if (content.indexOf('IPsTableAction') !== -1) {
    content = content.replace(/IPsTableAction/g, 'IZvTableAction');
  }
  if (content.indexOf('PsTableMode') !== -1) {
    content = content.replace(/PsTableMode/g, 'ZvTableMode');
  }
  if (content.indexOf('IPsTableSortDefinition') !== -1) {
    content = content.replace(/IPsTableSortDefinition/g, 'IZvTableSortDefinition');
  }
  if (content.indexOf('IPsTableUpdateDataInfo') !== -1) {
    content = content.replace(/IPsTableUpdateDataInfo/g, 'IZvTableUpdateDataInfo');
  }
  if (content.indexOf('PsTableActionScope') !== -1) {
    content = content.replace(/PsTableActionScope/g, 'ZvTableActionScope');
  }
  if (content.indexOf('IPsTableSetting') !== -1) {
    content = content.replace(/IPsTableSetting/g, 'IZvTableSetting');
  }
  if (content.indexOf('PsTableSettingsService') !== -1) {
    content = content.replace(/PsTableSettingsService/g, 'ZvTableSettingsService');
  }
  if (content.indexOf('PsTableComponent') !== -1) {
    content = content.replace(/PsTableComponent/g, 'ZvTableComponent');
  }
  if (content.indexOf('PsTableModule') !== -1) {
    content = content.replace(/PsTableModule/g, 'ZvTableModule');
  }
  if (content.indexOf('PsTableActionsComponent') !== -1) {
    content = content.replace(/PsTableActionsComponent/g, 'ZvTableActionsComponent');
  }
  if (content.indexOf('PsTableActionsToRenderPipe') !== -1) {
    content = content.replace(/PsTableActionsToRenderPipe/g, 'ZvTableActionsToRenderPipe');
  }
  if (content.indexOf('PsTableActionTypePipe') !== -1) {
    content = content.replace(/PsTableActionTypePipe/g, 'ZvTableActionTypePipe');
  }

  if (content.indexOf('IPsViewDataSource') !== -1) {
    content = content.replace(/IPsViewDataSource/g, 'IZvViewDataSource');
  }
  if (content.indexOf('PsViewComponent') !== -1) {
    content = content.replace(/PsViewComponent/g, 'ZvViewComponent');
  }
  if (content.indexOf('PsViewModule') !== -1) {
    content = content.replace(/PsViewModule/g, 'ZvViewModule');
  }

  tree.overwrite(file.path, content);
  touchedFiles.push(file.path);
}
