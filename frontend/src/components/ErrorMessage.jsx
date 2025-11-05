

// export default function ErrorMessage({children}) {
//     return (
//         <p className="rounded-md py-1 px-3 bg-red-200 text-danger uppercase text-sm font-bold">{children}</p>
//     )
// }

import { useEffect, useState } from "react";

export default function ErrorMessage({ children }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Si hay contenido, lo mostramos con fade-in
        if (children) setVisible(true);
        else setVisible(false);
    }, [children]);

    return (
        <div
        className={`
            rounded-md border py-1 px-2 border-red-500 text-red-500 uppercase text-xs font-bold transition-all duration-300 ease-in-out
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}
        `}
        >
        {children}
        </div>
    );
}