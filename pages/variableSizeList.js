import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import uuid from "@/common/uuid";
import styled from 'styled-components'
import {throttle} from "@/common/throttle";



export default function Home() {
  const [list, setList] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    setList(Array.from({length: 1000}).map((item, index) => ({
      uuid: uuid(),
      height: Math.floor(Math.random() * (100 - 20 + 1) + 26),
      index,
    })))
  }, [])

  return (
    <ContainerSC ref={ref}>
      <VirtualList list={list} minHeight={26} parentRef={ref}>
        <List />
      </VirtualList>
    </ContainerSC>
  )
}

const List = ({item, index}) => {
  return <ListSC listHeight={item.height}>{item.uuid}_{item.index}</ListSC>
};

function VirtualList({minHeight, list, children, parentRef}) {
  const [virtualList, setVirtualList] = useState([]);
  const [topIndex, setTopIndex] = useState(0);
  const topRef = useRef({
    topElement: null,
    topElementHiddenHeight: null,
  })
  const handler = useCallback(throttle((e) => {
    const {topElement, topElementHiddenHeight, topElementIndex} = getTopVisibleElement( parentRef.current);
    setTopIndex(topElementIndex);
    topRef.current.topElement = topElement;
    topRef.current.topElementHiddenHeight = topElementHiddenHeight;
  }, 500), [])

  useEffect(() => {
    parentRef.current.addEventListener('scroll', handler)

    return () => {
      parentRef.current.removeEventListener('scroll', handler)
    }
  }, [])

  useLayoutEffect(() => {
    if(list.length) {
      const height = parentRef.current.clientHeight;

      const defaultSize = height/minHeight;
      const startIndex = topIndex - 5 < 0 ? 0:topIndex - 5;
      const actualIndex = virtualList[startIndex] ? list.findIndex(li => li.uuid === virtualList[startIndex].uuid) : startIndex;
      setVirtualList(list.slice(actualIndex,actualIndex + defaultSize));
      if( topRef.current.topElement ) {
        parentRef.current.removeEventListener('scroll', handler)
        scrollToElement(parentRef.current,  topRef.current.topElement ,  topRef.current.topElementHiddenHeight )
        setTimeout(() => {
          parentRef.current.addEventListener('scroll', handler)
        })
      }
    }
  }, [list, topIndex])


  return(
    <>
      {
        virtualList.map((li, index) =>
          React.cloneElement(
            children,
            {
              key: li.uuid,
              item: li,
              index,
            }
          )
        )
      }
    </>
  )
}

function getTopVisibleElement(containerDom) {
  if (!containerDom) return null;

  const children = containerDom.children;
  for (let i = 0; i < children.length; i++) {
    const rect = children[i].getBoundingClientRect();
    if (rect.top + rect.height >= 0) {
      return {
        topElementIndex: i,
        topElement: children[i],
        topElementHiddenHeight: (rect.top < containerDom.getBoundingClientRect().top) ? (containerDom.getBoundingClientRect().top - rect.top) : 0
      };
    }
  }

  return null;
}

function scrollToElement(containerDom, targetDom, hiddenHeight = 0) {
  const scrollDistance = targetDom.getBoundingClientRect().top - containerDom.getBoundingClientRect().top + containerDom.scrollTop + hiddenHeight;
  containerDom.scrollTop = scrollDistance;
}


const ContainerSC = styled('div')`
  width: 100%;
  height: 100vh;
  background: red;
  overflow: auto;
`;

const ListSC = styled('div', ['listHeight'])`
  height: ${props => props.listHeight}px;
  display: flex;
  align-items: center;
`;

