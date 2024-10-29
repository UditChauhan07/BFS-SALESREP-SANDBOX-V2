import React, { useState } from "react";
import styles from "./styles.module.css";

const SelectableCardList = ({ data = [], title = null, onCardSelect }) => {
    const [selectedValue, setSelectedValue] = useState(null);

    const handleSelect = (value) => {
        setSelectedValue(value);
        onCardSelect?.(value); // Call the function to return the selected card value
    };

    if (!data.length) return null; // Return null if no data is provided

    return (
        <div>
            {title ? <p className={styles.cardTitle}>{title}</p> : null}
            <div className={styles.cardList} id={title.replaceAll(/\s+/g, '-')}>
                {data.map((element) => (
                    <div
                        key={element.id}
                        className={`${styles.card} ${selectedValue === element.value ? styles.selectedCard : ""
                            }`}
                        onClick={() => handleSelect(element.value)}
                    >
                        <input
                            type="radio"
                            name="select-card"
                            className={styles.inputNone}
                            checked={selectedValue === element.value}
                            onChange={() => handleSelect(element.value)}
                        />
                        <label>{element.name}</label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SelectableCardList;
