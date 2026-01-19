import { create } from "zustand";

interface textFontSize {
    fontSize: string,
    setFontSize: (newSize: string) => void
}
const useTextFontSize = create((set): textFontSize => {
    return {
        fontSize: "",
        setFontSize: (newSize: string) => {
            set({ fontSize: newSize });
        }
    }
});
export default useTextFontSize;