import { fakeAsync } from '@angular/core/testing';
import { MatSelect } from '@angular/material/select';
import { Subject } from 'rxjs';
import { PsSelectComponent } from './select.component';

function createMatSelect(): MatSelect {
  const matSelect = <any>{
    stateChanges: new Subject<void>(),
    close: () => {},
    _onChange: null,
    _onTouched: null,
  };

  matSelect.registerOnChange = (val: any) => {
    matSelect._onChange = val;
  };
  matSelect.registerOnTouched = (val: any) => {
    matSelect._onTouched = val;
  };

  return matSelect;
}

describe('PsSelectComponent', () => {
  it('should fix MatSelect.close() not emitting stateChanges', fakeAsync(() => {
    const matSelect = createMatSelect();

    const service = new PsSelectComponent(null, null, null);
    service.setMatSelect = matSelect;

    spyOn(matSelect.stateChanges, 'next');

    matSelect.close();

    expect(matSelect.stateChanges.next).toHaveBeenCalled();
  }));

  it('should also call PsSelect._onChange() when MatSelect._onChange() is called', fakeAsync(() => {
    const matSelect = createMatSelect();

    const service = new PsSelectComponent(null, null, null);
    service.setMatSelect = matSelect;

    let orgOnChangeCallbackCalled = false;
    const onChangeCallback = () => {
      orgOnChangeCallbackCalled = true;
    };
    matSelect.registerOnChange(onChangeCallback);

    spyOn(<any>service, '_onChange');

    matSelect._onChange('test');

    expect(orgOnChangeCallbackCalled).toBeTruthy();
    expect((<any>service)._onChange).toHaveBeenCalledWith('test');
  }));

  it('should also call PsSelect._onTouched() when MatSelect._onTouched() is called', fakeAsync(() => {
    const matSelect = createMatSelect();

    const service = new PsSelectComponent(null, null, null);
    service.setMatSelect = matSelect;

    let orgOnTouchedCallbackCalled = false;
    const onTouchedCallback = () => {
      orgOnTouchedCallbackCalled = true;
      return {};
    };
    matSelect.registerOnTouched(onTouchedCallback);

    spyOn(<any>service, '_onTouched');

    matSelect._onTouched();

    expect(orgOnTouchedCallbackCalled).toBeTruthy();
    expect((<any>service)._onTouched).toHaveBeenCalled();
  }));

  it('should not enable/disable formControl, if it is already', fakeAsync(() => {
    // formControl enable/disable calls setDisabledState on the valueAccessor, which is the PsSelect -> endless loop
    const service = new PsSelectComponent(null, null, null);
    service.formControl.enable();

    spyOn(service.formControl, 'enable');
    service.setDisabledState(false);
    expect(service.formControl.enable).not.toHaveBeenCalled();

    service.formControl.disable();

    spyOn(service.formControl, 'disable');
    service.setDisabledState(false);
    expect(service.formControl.disable).not.toHaveBeenCalled();
  }));
});
