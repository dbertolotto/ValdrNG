import {TestBed} from '@angular/core/testing';

import {ValdrNgService} from './valdr-ng.service';
import {AbstractControl, ValidatorFn} from "@angular/forms";
import {BaseValidatorFactory} from "./validators/base-validator-factory";
import {ValdrValidationFn} from "./model";

describe('ValdrNgService', () => {
  let service: ValdrNgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValdrNgService);
  });

  it('should be created', () => {
    // given / when / then
    expect(service).toBeTruthy();
  });

  it('should set constraints', () => {
    // given
    const constraints = {
      'Person': {
        'firstName': {
          'size': {
            'min': 2,
            'max': 20,
            'message': 'First name must be between 2 and 20 characters.'
          }
        }
      }
    };

    // when
    service.setConstraints(constraints);

    // then
    expect((service as any).constraints).toBe(constraints);
  });

  it('should add validators', () => {
    // given
    const model = {
      addressLine1: 'Address Line.'
    }
    const constraint = {
      'Address': {
        'addressLine1': {
          'required': {
            'message': 'Address line is required.'
          }
        }
      }
    };

    // when
    service.addConstraints(constraint);

    // then
    expect(service.createFormGroupControls(model, 'Address')).toBeDefined();
  });

  it('it should add valdr validators', () => {
    // given
    const validator: BaseValidatorFactory = {
      createValidator(): ValdrValidationFn[] {
        return [(control: AbstractControl) => null];
      },
      canHandle(): boolean {
        return true;
      }
    };

    // when
    service.addValidators([validator]);

    // then
    expect((service as any).validators).toContain(validator);
  });

  describe('createValidators', () => {
    beforeEach(() => {
      service.setConstraints({
        'Person': {
          'firstName': {
            'size': {
              'min': 2,
              'max': 20,
              'message': 'First name must be between 2 and 20 characters.'
            },
            'required': {
              'message': 'First name is required.'
            }
          },
          'address': {
            'street': {
              'required': {
                'message': 'Street is required.'
              }
            }
          }
        }
      })
    });

    it('should throw error if the model is not present', () => {
      // given / when / then
      expect(() => service.createFormGroupControls({}, 'SomeModel'))
        .toThrow(new Error('No constraints provided for model SomeModel.'));
    })

    it('should create constraints for first name', () => {
      // given
      const model = {firstName: 'Stanoja'};

      // when
      const formGroup = service.createFormGroupControls(model, 'Person');

      // then
      expect(formGroup).toBeDefined();
      expect(formGroup.firstName).toEqual(jasmine.arrayContaining(['Stanoja']));
    });

    it('should create additional constraints for fields which are not present in the model', () => {
      // given
      const model = {firstName: 'Stanoja', lastName: 'Sst'};
      const validatorFn = () => null;
      const additionalControls = {
        lastName: [validatorFn]
      } as { [key: string]: ValidatorFn[] };

      // when
      const formGroup = service.createFormGroupControls(model, 'Person', additionalControls);

      // then
      expect(formGroup.lastName).toEqual(jasmine.arrayContaining(['Sst', [validatorFn]]))
    });
  });
});