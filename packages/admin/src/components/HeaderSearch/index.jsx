import { SearchOutlined } from '@ant-design/icons';
import { AutoComplete, Input } from 'antd';
import classNames from 'classnames';
import useMergedState from 'rc-util/es/hooks/useMergedState';
import { useRef } from 'react';
import styles from './index.less';

const HeaderSearch = (props) => {
  const {
    className,
    defaultValue,
    onVisibleChange,
    placeholder,
    visible,
    defaultVisible,
    ...restProps
  } = props;
  const inputRef = useRef(null);
  const [value, setValue] = useMergedState(defaultValue, {
    value: props.value,
    onChange: props.onChange,
  });
  const [searchMode, setSearchMode] = useMergedState(defaultVisible ?? false, {
    value: props.visible,
    onChange: onVisibleChange,
  });
  const inputClass = classNames(styles.input, {
    [styles.show]: searchMode,
  });
  return (
    <div
      className={classNames(className, styles.headerSearch)}
      onClick={() => {
        setSearchMode(true);

        if (searchMode && inputRef.current) {
          inputRef.current.focus();
        }
      }}
      onTransitionEnd={({ propertyName }) => {
        if (propertyName === 'width' && !searchMode) {
          if (onVisibleChange) {
            onVisibleChange(searchMode);
          }
        }
      }}
    >
      <SearchOutlined
        key="Icon"
        style={{
          cursor: 'pointer',
        }}
      />
      <AutoComplete
        key="AutoComplete"
        className={inputClass}
        value={value}
        options={restProps.options}
        onChange={(completeValue) => setValue(completeValue)}
      >
        <Input
          size="small"
          ref={inputRef}
          defaultValue={defaultValue}
          aria-label={placeholder}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (restProps.onSearch) {
                restProps.onSearch(value);
              }
            }
          }}
          onBlur={() => {
            setSearchMode(false);
          }}
        />
      </AutoComplete>
    </div>
  );
};

export default HeaderSearch;
