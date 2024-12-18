interface StorybookI {
  id: number
  name: string
  cover: string
}
export function GameStorybookDialog({ storybooks, onSelectStorybook, selectedItem }: { storybooks: StorybookI[]; onSelectStorybook: (storybook: StorybookI) => void; selectedItem: StorybookI }) {
  function renderStorybook() {
    const list = storybooks.map(item => {
      const isSelect = item.id === selectedItem?.id
      return (
        <li className={`relative w-[250px] h-[500px] cursor-pointer ${isSelect ? 'selected' : ''}`} onClick={() => onSelectStorybook(item)} key={'storybook' + item.id} style={{background: `url(${item.cover}) 50% 50% / cover no-repeat`}}>
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
      <header className="text-center p-20">选择剧本</header>
      {renderStorybook()}
    </div>
  )
}
