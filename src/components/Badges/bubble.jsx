import { useState } from "react";
import { originAPi } from "../../lib/store";
import Styles from "./styles.module.css";

const Bubbles = ({ data = [], title = null,value=null, handleChange }) => {
    const [selectedValue, setSelectedValue] = useState(value);

    const handleSelect = (value) => {
        setSelectedValue(value);
        handleChange?.(value); // Call the function to return the selected card value
    };
    if (!data.length) return null; // Return null if no data is provided

    const ImageWithFallback = ({ src, alt, fallbackSrc, ...props }) => {
        if (!fallbackSrc) fallbackSrc = originAPi + "/dummy.png"
        const handleError = (e) => {
            e.target.onerror = null; // Prevent infinite loop if fallback image also fails
            e.target.src = fallbackSrc;
        };

        return <img src={src} alt={alt} onError={handleError} {...props} />;
    };

    return (
        <div>
            {title ? <p className={Styles.cardTitle}>{title}</p> : null}
            <div className={`${Styles.dFlex} ${Styles.gap10} mt-4`}>
                {data.map((brand) => (
                    <div
                        key={brand.Id}
                        className={`${Styles.templateHolder} ${selectedValue == brand.Id ? Styles.selected : ''}`}
                        onClick={() => handleSelect(brand.Id)}
                    >
                        <input
                            type="radio"
                            name="brand"
                            checked={selectedValue == brand.Id}
                            value={brand.Id}
                            required
                            className={Styles.hiddenRadio}
                        />
                        <ImageWithFallback
                            src={`${originAPi}/brandImage/${brand.Id}.png`}
                            title={`Click to select ${brand.Name}`}
                            style={{ maxHeight: '100px', mixBlendMode: 'luminosity' }}
                            alt={`Brand ${brand.Id}`}
                        />
                        <p className={Styles.labelHolder}>{brand.Name}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default Bubbles;