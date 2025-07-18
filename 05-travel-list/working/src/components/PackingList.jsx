import {useState} from "react";

export default function PackingList({items , onDeleteItem , onToggleItem , onClearItems}) {

    const [sortBy , setSortBy] = useState('input')

    let sortedItems;

    if(sortBy === 'input'){
        sortedItems = items;
    }

    if (sortBy === 'description'){
        sortedItems = items.slice().sort((a,b) => a.description.localeCompare(b.description))
    }
    if (sortBy === 'packed'){
        sortedItems = items.slice().sort((a,b) => Number(a.packed) - Number(b.packed))

    }
    return (

        <div className="list">
            <ul>
                {sortedItems.map((item) => (
                    <Item item={item} key={item.id} onDeleteItem={onDeleteItem} onToggleItem={onToggleItem} />
                ))}
            </ul>

            <div className='actions'>
                <select name="" id="" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="input">Sort by the input order</option>
                    <option value="description">Sort by description</option>
                    <option value="packed">Sort by packed status</option>
                </select>
                <button onClick={onClearItems}>Clear list</button>
            </div>
        </div>
    );
}
