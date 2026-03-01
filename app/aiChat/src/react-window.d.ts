declare module 'react-window' {
    import * as React from 'react';

    export type Align = 'auto' | 'smart' | 'center' | 'end' | 'start';

    export interface ListChildComponentProps<T = any> {
        index: number;
        style: React.CSSProperties;
        data: T;
        isScrolling?: boolean;
    }

    export interface VariableSizeListProps<T = any> {
        height: number;
        width: number;
        itemCount: number;
        itemSize: (index: number) => number;
        itemData?: T;
        estimatedItemSize?: number;
        className?: string;
        outerRef?: React.Ref<HTMLDivElement>;
        onScroll?: () => void;
        children: React.ComponentType<ListChildComponentProps<T>>;
    }

    export class VariableSizeList<T = any> extends React.Component<VariableSizeListProps<T>> {
        scrollToItem(index: number, align?: Align): void;
        resetAfterIndex(index: number, shouldForceUpdate?: boolean): void;
    }
}
