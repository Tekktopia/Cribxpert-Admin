/**
 * Custom hook for secure form validation
 * Integrates input sanitization with React form handling
 *
 * Security note: This file uses dynamic object access for form field management.
 * All field names are validated against a strict regex pattern before use.
 */

/* eslint-disable security/detect-object-injection */

import { useState, useCallback, useMemo } from "react";
import { InputSanitizer } from "../utils/inputSanitization";
import type {
  ValidationResult,
  ValidationOptions,
} from "../utils/inputSanitization";

export interface FieldConfig {
  type:
    | "text"
    | "email"
    | "phone"
    | "name"
    | "number"
    | "url"
    | "html"
    | "fileName";
  options?: ValidationOptions;
  numberOptions?: { min?: number; max?: number; integer?: boolean };
  required?: boolean;
  customValidator?: (value: string) => string | null;
}

export interface FormConfig {
  readonly [fieldName: string]: FieldConfig;
}

export interface FieldState {
  readonly value: string;
  readonly sanitizedValue: string;
  readonly errors: readonly string[];
  readonly touched: boolean;
  readonly isValid: boolean;
}

export interface FormState {
  readonly [fieldName: string]: FieldState;
}

export interface UseSecureFormResult {
  readonly formState: FormState;
  readonly updateField: (fieldName: string, value: string) => void;
  readonly touchField: (fieldName: string) => void;
  readonly validateForm: () => boolean;
  readonly resetForm: () => void;
  readonly resetField: (fieldName: string) => void;
  readonly getFieldProps: (fieldName: string) => {
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly onBlur: () => void;
    readonly error: string | undefined;
    readonly isValid: boolean;
  };
  readonly isFormValid: boolean;
  readonly hasErrors: boolean;
  readonly getSanitizedData: () => Record<string, string>;
}

/**
 * Validate that a field name is safe to use
 */
const FIELD_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const isValidFieldName = (fieldName: string): boolean => {
  return (
    typeof fieldName === "string" &&
    fieldName.length > 0 &&
    fieldName.length <= 100 &&
    FIELD_NAME_REGEX.test(fieldName)
  );
};

/**
 * Custom hook for secure form handling with automatic sanitization
 */
export function useSecureForm(
  config: FormConfig,
  initialValues: Record<string, string> = {}
): UseSecureFormResult {
  /**
   * Validate a field value using the appropriate sanitization method
   */
  const validateFieldValue = useCallback(
    (
      fieldName: string,
      value: string,
      fieldConfig: FieldConfig
    ): ValidationResult => {
      let result: ValidationResult;

      switch (fieldConfig.type) {
        case "email":
          result = InputSanitizer.sanitizeEmail(value);
          break;

        case "phone":
          result = InputSanitizer.sanitizePhoneNumber(value);
          break;

        case "name":
          result = InputSanitizer.sanitizeName(value, fieldConfig.options);
          break;

        case "number":
          result = InputSanitizer.sanitizeNumber(
            value,
            fieldConfig.numberOptions
          );
          break;

        case "url":
          result = InputSanitizer.sanitizeUrl(value);
          break;

        case "fileName":
          result = InputSanitizer.sanitizeFileName(value);
          break;

        case "html": {
          const htmlOptions = { ...fieldConfig.options, allowHtml: true };
          result = InputSanitizer.sanitizeGeneralInput(value, htmlOptions);
          break;
        }

        case "text":
        default: {
          const textOptions = { ...fieldConfig.options, allowHtml: false };
          result = InputSanitizer.sanitizeGeneralInput(value, textOptions);
          break;
        }
      }

      // Apply custom validation if provided
      if (fieldConfig.customValidator && result.isValid) {
        const customError = fieldConfig.customValidator(result.sanitizedValue);
        if (customError) {
          result.errors.push(customError);
          result.isValid = false;
        }
      }

      // Check required field
      if (fieldConfig.required && !result.sanitizedValue.trim()) {
        result.errors.push(`${fieldName} is required`);
        result.isValid = false;
      }

      return result;
    },
    []
  );

  /**
   * Create initial form state with validation
   */
  const createInitialState = useMemo((): FormState => {
    const state: Record<string, FieldState> = {};

    // Get valid field names to prevent injection
    const configKeys = Object.keys(config);
    const validFieldNames = configKeys.filter(isValidFieldName);

    for (let i = 0; i < validFieldNames.length; i++) {
      const fieldName = validFieldNames[i];

      if (Object.prototype.hasOwnProperty.call(config, fieldName)) {
        const fieldConfig = config[fieldName];
        const initialValue = Object.prototype.hasOwnProperty.call(
          initialValues,
          fieldName
        )
          ? initialValues[fieldName] || ""
          : "";

        const validation = validateFieldValue(
          fieldName,
          initialValue,
          fieldConfig
        );

        state[fieldName] = {
          value: initialValue,
          sanitizedValue: validation.sanitizedValue,
          errors: validation.errors,
          touched: false,
          isValid: validation.isValid,
        };
      }
    }

    return state;
  }, [config, initialValues, validateFieldValue]);

  const [formState, setFormState] = useState<FormState>(createInitialState);

  /**
   * Update a field value and validate it
   */
  const updateField = useCallback(
    (fieldName: string, value: string) => {
      if (
        !isValidFieldName(fieldName) ||
        !Object.prototype.hasOwnProperty.call(config, fieldName)
      ) {
        return;
      }

      const fieldConfig = config[fieldName];
      const validation = validateFieldValue(fieldName, value, fieldConfig);

      setFormState((prev) => {
        if (!Object.prototype.hasOwnProperty.call(prev, fieldName)) {
          return prev;
        }

        const currentField = prev[fieldName];

        return {
          ...prev,
          [fieldName]: {
            ...currentField,
            value,
            sanitizedValue: validation.sanitizedValue,
            errors: validation.errors,
            isValid: validation.isValid,
          },
        };
      });
    },
    [config, validateFieldValue]
  );

  /**
   * Mark a field as touched
   */
  const touchField = useCallback(
    (fieldName: string) => {
      if (
        !isValidFieldName(fieldName) ||
        !Object.prototype.hasOwnProperty.call(formState, fieldName)
      ) {
        return;
      }

      setFormState((prev) => {
        const currentField = prev[fieldName];
        if (currentField.touched) return prev;

        return {
          ...prev,
          [fieldName]: {
            ...currentField,
            touched: true,
          },
        };
      });
    },
    [formState]
  );

  /**
   * Validate entire form
   */
  const validateForm = useCallback(() => {
    let isValid = true;
    const newFormState: Record<string, FieldState> = {};

    const configKeys = Object.keys(config);
    const validFieldNames = configKeys.filter(isValidFieldName);

    for (let i = 0; i < validFieldNames.length; i++) {
      const fieldName = validFieldNames[i];

      if (
        Object.prototype.hasOwnProperty.call(config, fieldName) &&
        Object.prototype.hasOwnProperty.call(formState, fieldName)
      ) {
        const fieldConfig = config[fieldName];
        const fieldState = formState[fieldName];

        const validation = validateFieldValue(
          fieldName,
          fieldState.value,
          fieldConfig
        );

        newFormState[fieldName] = {
          ...fieldState,
          sanitizedValue: validation.sanitizedValue,
          errors: validation.errors,
          isValid: validation.isValid,
          touched: true,
        };

        if (!validation.isValid) {
          isValid = false;
        }
      }
    }

    setFormState((prev) => ({ ...prev, ...newFormState }));
    return isValid;
  }, [config, formState, validateFieldValue]);

  /**
   * Reset entire form
   */
  const resetForm = useCallback(() => {
    setFormState(createInitialState);
  }, [createInitialState]);

  /**
   * Reset a specific field
   */
  const resetField = useCallback(
    (fieldName: string) => {
      if (
        !isValidFieldName(fieldName) ||
        !Object.prototype.hasOwnProperty.call(config, fieldName)
      ) {
        return;
      }

      const fieldConfig = config[fieldName];
      const initialValue = Object.prototype.hasOwnProperty.call(
        initialValues,
        fieldName
      )
        ? initialValues[fieldName] || ""
        : "";

      const validation = validateFieldValue(
        fieldName,
        initialValue,
        fieldConfig
      );

      setFormState((prev) => ({
        ...prev,
        [fieldName]: {
          value: initialValue,
          sanitizedValue: validation.sanitizedValue,
          errors: validation.errors,
          touched: false,
          isValid: validation.isValid,
        },
      }));
    },
    [config, initialValues, validateFieldValue]
  );

  /**
   * Get field properties for form integration
   */
  const getFieldProps = useCallback(
    (fieldName: string) => {
      if (!isValidFieldName(fieldName)) {
        return {
          value: "",
          onChange: () => {},
          onBlur: () => {},
          error: "Invalid field name",
          isValid: false,
        };
      }

      const hasField = Object.prototype.hasOwnProperty.call(
        formState,
        fieldName
      );
      const fieldState = hasField ? formState[fieldName] : null;

      return {
        value: fieldState?.value || "",
        onChange: (value: string) => updateField(fieldName, value),
        onBlur: () => touchField(fieldName),
        error:
          fieldState?.touched && fieldState.errors.length > 0
            ? fieldState.errors[0]
            : undefined,
        isValid: fieldState?.isValid || false,
      };
    },
    [formState, updateField, touchField]
  );

  /**
   * Check if entire form is valid
   */
  const isFormValid = useMemo(() => {
    const configKeys = Object.keys(config);
    const validFieldNames = configKeys.filter(isValidFieldName);

    return validFieldNames.every((fieldName) => {
      const hasField = Object.prototype.hasOwnProperty.call(
        formState,
        fieldName
      );
      return hasField ? formState[fieldName].isValid : false;
    });
  }, [config, formState]);

  /**
   * Check if form has any errors
   */
  const hasErrors = useMemo(() => {
    const stateKeys = Object.keys(formState);

    return stateKeys.some((fieldName) => {
      const hasField = Object.prototype.hasOwnProperty.call(
        formState,
        fieldName
      );
      const fieldState = hasField ? formState[fieldName] : null;
      return fieldState && fieldState.errors.length > 0;
    });
  }, [formState]);

  /**
   * Get sanitized form data
   */
  const getSanitizedData = useCallback(() => {
    const sanitizedData: Record<string, string> = {};
    const stateKeys = Object.keys(formState);
    const validFieldNames = stateKeys.filter(isValidFieldName);

    for (let i = 0; i < validFieldNames.length; i++) {
      const fieldName = validFieldNames[i];

      if (Object.prototype.hasOwnProperty.call(formState, fieldName)) {
        const fieldState = formState[fieldName];
        sanitizedData[fieldName] = fieldState.sanitizedValue;
      }
    }

    return sanitizedData;
  }, [formState]);

  return {
    formState,
    updateField,
    touchField,
    validateForm,
    resetForm,
    resetField,
    getFieldProps,
    isFormValid,
    hasErrors,
    getSanitizedData,
  };
}
