import React, {
  useEffect, useState, useRef, useCallback,
} from 'react';
import styled from 'styled-components';
import useStore from "@/store";
import SimpleLogin from "@/business_components/simple_login";

export default function TopBar({
                                 onFileSaved,
                                 editorRef,
                                 onFileTextChange,
                               }) {
  const [deviceInfo] = useStore.deviceInfo();

  return (
    <ContainerSC>
      <RightPartSC>
        <SimpleLogin />
      </RightPartSC>
    </ContainerSC>
  );
}


const ContainerSC = styled('div')`
  padding: 8px 0;
  display: flex;
  justify-content: end;
  align-items: center;
  width: 100%;
  height: fit-content;
  position: relative;
  min-height: 30px;

  @media (max-height: 350px) {
    display: none;
  }
`;

const BackSC = styled('div')`
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
  left: 10px;

  .icon {
    width: 24px;
    height: 24px;
    fill: #BA9726;
  }
`;

const FoldSC = styled('div')`
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
  left: 10px;

  .icon {
    width: 28px;
    height: 28px;
    fill: rgba(186,186,186,0.45);
  }
`;

const LeftPartSC = styled('div')`
  padding-left: 50px;
`;

const LabelNameSC = styled('div')`
  color: #BA9726;
  font-weight: 800;
  font-size: 1.8rem;
`;

const RightPartSC = styled('div')`
  display: flex;
  align-items: center;
  padding-right: 10px;
`;

const ToolsSC = styled('div')`
  //border-left: 1px #505050 solid;
  border-right: 1px #505050 solid;
  padding: 0 30px;
  margin: 0 30px;
  display: flex;
`;

const InboxContainerSC = styled('div')`
  position: absolute;
  max-width: 600px;
  max-height: 500px;
  background: #323436;
  left: 20px;
  right: 20px;
  top: 20px;
  bottom: 20px;
  margin: auto;
  z-index: 10000;
  border-radius: 4px;
  box-shadow: 0 2px 2px 0 rgb(0 0 0 / 1%), 0 3px 1px -2px rgb(0 0 0 / 12%), 0 1px 5px 0 rgb(0 0 0 / 6%);
  padding: 5px 0;
  display: flex;
  flex-direction: column;
`;

const EditContainerSC = styled('div')`
  flex: 1;
`;

const BottomContainerSC = styled('div')`
`;

const AddButtonSC = styled('button')`
  position: absolute;
  right: 10px;
  bottom: 10px;
  color: rgb(195, 195, 195);
  border: none;
  background: #BA9726;
  padding: 5px 10px;
`;

const NewFileSC = styled('button')`
  cursor: pointer;
  height: 32px;
  padding: 4px 11px;
  font-size: 14px;
  border-radius: 6px;
  min-width: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  outline: none;
  //color:  rgb(186, 151, 38);
  //border: 1px solid rgb(186, 151, 38);
  color: rgba(186, 186, 186, 1);
  border: 1px solid rgba(186, 186, 186, 1);
  margin-right: 10px;
  white-space: nowrap;
`;

const QuickFileSC = styled('button')`
  cursor: pointer;
  height: 32px;
  padding: 4px 11px;
  font-size: 14px;
  border-radius: 6px;
  min-width: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  outline: none;
  color: rgba(186, 186, 186, 1);
  border: 1px solid rgba(186, 186, 186, 1);
  white-space: nowrap;
  //color:  rgb(186, 151, 38);
  //border: 1px solid rgb(186, 151, 38);
`;
