interface CharacterI {
  id: number
  name: string
  sex: 'male' | 'female'
  profession: string
  portrait: string
  background: string
}
export function GameCharacterDialog({ characters, onSelectCharacter, selectedItem }: { characters: CharacterI[]; onSelectCharacter: (storybook: CharacterI) => void; selectedItem: CharacterI }) {
  function renderCharacters() {
    const list = characters.map(item => {
      const isSelect = item.id === selectedItem?.id
      return (
        <li className={`opacity-100 active:opacity-80 relative w-[250px] h-[500px] cursor-pointer ${isSelect ? 'selected' : ''}`} onClick={() => onSelectCharacter(item)} key={'character' + item.id} style={{background: `url(${item.portrait}) 50% 50% / cover no-repeat, url(${item.background}) 50% 50% / cover no-repeat`, boxShadow: '1px 1px 5px rgba(0,0,0,0.6)'}}>
          <div className="absolute bottom-0 w-[100%] h-[50px] p-10 text-center" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)'}}>
            <span style={{color: '#fff'}}>{item.name}</span>
          </div>
        </li>
      )
    })
    return <ul className="flex justify-around">{list}</ul>
  }
  return (
    <div className="h-[100%]">
      <header className="text-center p-20">选择人物</header>
      {renderCharacters()}
    </div>
  )
}
