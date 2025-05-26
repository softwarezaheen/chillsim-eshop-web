import {
  Autocomplete,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  InputAdornment,
  Switch,
  TextField,
} from "@mui/material";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import React, { useEffect, useState } from "react";

export const FormInput = (props) => {
  const {
    variant,
    onClick,
    startAdornment,
    placeholder,
    onChange,
    helperText,
  } = props;

  return (
    <TextField
      className={props.className}
      fullWidth
      onClick={onClick}
      value={props.value}
      placeholder={placeholder}
      variant={variant}
      onChange={(e) => onChange(e.target.value)}
      helperText={helperText}
      disabled={props.disabled}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ),
          autoComplete: "new-password",
          form: {
            autoComplete: "off",
          },
        },
      }}
      size="small"
    />
  );
};

export const FormTextArea = (props) => {
  const {
    rows,
    label,
    value,
    required,
    onChange,
    helperText,
    placeholder,
    disabled,
  } = props;

  const handleOnChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <TextField
      fullWidth
      variant="outlined"
      multiline
      className="text-area-field"
      rows={rows ? rows : 4}
      size="small"
      value={value}
      placeholder={placeholder}
      onChange={handleOnChange}
      helperText={helperText}
      disabled={disabled ? disabled : false}
      spellCheck="false"
      slotProps={{
        input: {
          "data-gramm": "false",
          "data-gramm_editor": "false",
          "data-enable-grammarly": "false",
          autoComplete: "off",
          form: {
            autoComplete: "off",
          },
        },
      }}
    />
  );
};

export const FormCheckBox = (props) => {
  const { onChange, disabled, helperText, label, value } = props;
  return (
    <FormControl>
      <FormGroup>
        <FormControlLabel
          sx={{
            marginRight:
              localStorage.getItem("i18nextLng") === "ar" ? 0 : undefined,
            alignItems: "flex-start",
          }}
          control={
            <Checkbox
              sx={{
                paddingRight:
                  localStorage.getItem("i18nextLng") === "ar" ? 0 : undefined,
              }}
              value={value}
              checked={value}
              disabled={disabled}
              onChange={(e, value) => onChange(value)}
              slotProps={{
                input: {
                  "aria-label": "controlled",
                },
              }}
            />
          }
          label={label}
        />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormGroup>
    </FormControl>
  );
};

export const FormDropdownList = (props) => {
  const {
    data,
    noOptionsText,
    loading,
    onChange,
    helperText,
    accessName,
    accessValue = "id",
  } = props;
  const { placeholder, variant, disabled, required } = props;
  const { value, filterDropdown } = props;

  const [val, setVal] = useState(null);
  useEffect(() => {
    setVal(value);
  }, [value]);

  return (
    <Autocomplete
      size="small"
      disabled={disabled}
      fullWidth
      disableClearable={required}
      ListboxProps={{ style: { maxHeight: 200, overflow: "auto" } }}
      getOptionLabel={(option) => option?.[accessName]}
      options={data}
      value={val}
      isOptionEqualToValue={(option, value) =>
        option?.[accessValue] == value?.[accessValue]
      }
      loadingText={"Loading"}
      noOptionsText={noOptionsText}
      loading={loading}
      onChange={(event, selected) => {
        if (!disabled) {
          onChange(selected);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant={variant}
          placeholder={placeholder}
          helperText={helperText}
          disabled={disabled}
          InputProps={{
            ...params.InputProps,
            autocomplete: "new-password",
            form: {
              autocomplete: "off",
            },
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
};
export const FormSwitch = (props) => {
  const { value, label, onChange } = props;

  return (
    <FormGroup aria-label="position" row>
      <FormControlLabel
        control={
          <Switch
            checked={value}
            color="primary"
            value={value}
            onChange={(e) => onChange(e.target.checked)}
          />
        }
        label={label}
        labelPlacement="end"
      />
    </FormGroup>
  );
};

export const FormPhoneInput = ({
  helperText,
  value,
  onChange,
  disabled,
  ...props
}) => {
  return (
    <FormGroup aria-label="position" row>
      <PhoneInput
        international
        className="w-full shadow-sm !bg-white disabled:bg-white rounded h-[40px] p-4 border-2 border-transparent hover:border-[#122644]"
        defaultCountry="LB"
        value={value}
        disabled={disabled}
        onChange={(value, country) => onChange(value)}
        numberInputProps={{
          className: "rounded-md px-4 focus:outline-none",
        }}
        {...props}
      />

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormGroup>
  );
};
