import { EditorHeader } from '@/components/editor/SceneEditor'
import { GameController } from '@/components/game/GameController'
import { GamePlayer } from '@/components/game/GamePlayer'
import { GameSetting } from '@/components/game/GameSetting'
import { GameStorybookDialog } from '@/components/game/GameStorybookDialog'
import { GameCharacterDialog } from '@/components/game/GameCharacterDialog'
import { useState, useEffect } from 'react'
import { useGameStore } from '@/store'
import { getPreset } from "@/game";

export function GamePage() {
  const game = useGameStore(state => state.game)
  const storybookList = useGameStore(state => state.storybookList)
  const [selectedStorybook, setSelectedStorybook] = useState<(typeof storybookList)[0]>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<(typeof storybookList)[0]['characterList'][0]>(null)
  function handleSelectStorybook(item: { id: number }) {
    const selected = storybookList.find(storybook => storybook.id === item.id)
    if (selected) setSelectedStorybook(selected)
  }
  function handleSelectCharacter(item: { id: number }) {
    if (!selectedStorybook) return
    const selected = selectedStorybook.characterList.find(character => character.id === item.id)
    if (selected) setSelectedCharacter(selected)
  }
  function renderGame() {
    if (!selectedStorybook) {
      return (
        <div className="absolute z-10 bg-card top-0 bottom-0 left-0 right-0">
          <GameStorybookDialog selectedItem={selectedStorybook} storybooks={storybookList} onSelectStorybook={handleSelectStorybook} />
        </div>
      )
    }
    if (!selectedCharacter) {
      return (
        <div className="absolute z-10 bg-card top-0 bottom-0 left-0 right-0">
          <GameCharacterDialog selectedItem={selectedCharacter} characters={selectedStorybook.characterList} onSelectCharacter={handleSelectCharacter} />
        </div>
      )
    }
    return null
  }
  useEffect(()=>{
    if(!selectedStorybook || !selectedCharacter) return
    console.log(getPreset(selectedStorybook, selectedCharacter))
    game.updateScreenplay(selectedStorybook.screenplay)
    game.updatePreset(getPreset(selectedStorybook, selectedCharacter))
  }, [selectedCharacter])
  return (
    <div className="h-screen flex flex-col">
      <EditorHeader />
      <main className="relative grid flex-1 gap-2 overflow-auto p-2 grid-cols-[2fr_1fr] bg-muted/50">
        {renderGame()}
        <div className="relative flex flex-col gap-2">
          <GamePlayer />
          <GameController />
        </div>
        <div className="relative flex flex-col gap-2">
          <GameSetting />
        </div>
      </main>
    </div>
  )
}
