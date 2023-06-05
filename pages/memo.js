import React, {useEffect, useMemo, useState} from "react";

function List({item}) {
  console.log(item.name)
  return(
    <div>
      {item.name}
    </div>
  )
}

const MomoedList = React.memo(List);

export default function Home() {
  const [list, setList] = useState([
    {
      name: 'w',
      uuid: 'adv'
    },
    {
      name: 'j',
      uuid: 'acv'
    },
    {
      name: 't',
      uuid: 'aav'
    }
  ])


  return (
    <div onClick={() => {
      list.push({
        name: 'y',
        uuid: 'sdc'
      })
      setList([...list])
    }}>
      {
        list.map((item) => <MomoedList item={item} key={item.uuid}/>)
      }
    </div>
  )
}

