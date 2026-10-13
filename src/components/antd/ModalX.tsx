'use client';
import Draggable from 'react-draggable';
import { GripHorizontal } from 'lucide-react';
import { useRef, useState } from 'react';
import { Modal, ModalProps } from 'antd';
interface DraggableModalProps extends ModalProps {
  title?: React.ReactNode;
  children?: React.ReactNode;
}
const ModalX: React.FC<DraggableModalProps> = ({ children, ...modalProps }) => {
  /* ---------------------------------- Hooks --------------------------------- */
  const draggleRef = useRef<HTMLDivElement>(null);
  const [disableDrag, setDisableDrag] = useState(true);
  /* ---------------------------- Helper Functions ---------------------------- */
  const dragProps = {
    onMouseOver: () => setDisableDrag(false),
    onMouseOut: () => setDisableDrag(true),
  };
  const dragButton = (side: 'top' | 'left' | 'right' | 'bottom') => {
    let className = `absolute flex cursor-move items-center justify-center gap-2 border-none bg-transparent text-gray-400 `;
    if (side === 'top') className += 'top-0 left-0 h-8 w-full';
    if (side === 'left') className += '-left-1 top-0 w-8 h-full';
    if (side === 'right') className += '-right-1 w-8 h-full top-0';
    if (side === 'bottom') className += 'bottom-0 h-8 w-full -left-0';
    if (side === 'top') {
      return (
        <button className={className} {...dragProps}>
          <GripHorizontal size={18} />
        </button>
      );
    }
    return <button className={className} {...dragProps} />;
  };
  /* ----------------------------------- UI ----------------------------------- */
  return (
    <Modal
      {...modalProps}
      title={
        <>
          {/* <div className="absolute h-full w-full" {...dragProps} /> */}
          {/* <button
                        className="absolute left-0 top-0 flex h-8 w-full cursor-move items-center justify-center gap-2 border-none  bg-transparent "
                        {...dragProps}
                    >
                        <GripHorizontal className="text-gray-300" />
                    </button> */}
          {dragButton('top')}
          {dragButton('left')}
          {dragButton('right')}
          {dragButton('bottom')}
          {modalProps?.title}
        </>
      }
      modalRender={(modal) => (
        <Draggable disabled={disableDrag} nodeRef={draggleRef}>
          <div ref={draggleRef}>{modal}</div>
        </Draggable>
      )}
    >
      <div className="pr-1">{children}</div>
    </Modal>
  );
};
export default ModalX;
