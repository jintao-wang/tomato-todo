import React, {forwardRef, useImperativeHandle, useRef, useState} from "react";

const InputContainer = forwardRef(({
                                     onChange,
                                     placeholder,
                                     onEnter,
                                     children
                                   }, ref) => {
  const [value, setValue] = useState('')

  const handleChange = (e) => {
    setValue(e.target.value);
    onChange?.(e.target.value);
  }

  useImperativeHandle(ref, () => ({
    setValue,
  }));

  const handleKeyUp = (e) => {
    if (e.keyCode === 13) {
      onEnter(value)
    }
  };

  return (
    React.cloneElement(
      children,
      {
        value: value,
        onChange: handleChange,
        placeholder: placeholder,
        onKeyUp: handleKeyUp,
      },
    )
  )
})

export default InputContainer;
