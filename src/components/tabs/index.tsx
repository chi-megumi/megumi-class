export type TabsVariant = 'primary' | 'secondary' | 'ghost' | 'icon' | 'danger' | 'link'

interface TabsProps {
  variant?: TabsVariant
  active: string
  onChange: (value: string) => void
  classNames?: {
    root?: string
    button?: string
  }
  tabs: {
    label: string
    value: string
  }[]
}

const Tabs = ({ active, onChange, tabs, classNames }: TabsProps) => {
  return (
    <div
      className={[
        'flex gap-2 bg-[rgba(255_255_255/75%)] p-1 backdrop-blur-md rounded-full',
        classNames?.root,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={[
            'bg-transparent rounded-full font-bold flex-1 py-2 px-4 cursor-pointer text-primary text-xs',
            classNames?.button,
            active === tab.value ? 'bg-white shadow-md text-(--primary)' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default Tabs
