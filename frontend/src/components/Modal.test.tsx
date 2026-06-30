import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders title and content", () => {
    render(
      <Modal closeLabel="Close modal" onClose={jest.fn()} title="Example">
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByRole("dialog", { name: "Example" })).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <Modal closeLabel="Close modal" onClose={onClose} title="Example">
        Content
      </Modal>
    );

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on backdrop click", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const { container } = render(
      <Modal closeLabel="Close modal" onClose={onClose} title="Example">
        Content
      </Modal>
    );

    await user.click(container.firstElementChild as Element);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when clicking inside the dialog", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <Modal closeLabel="Close modal" onClose={onClose} title="Example">
        <button type="button">Inside</button>
      </Modal>
    );

    await user.click(screen.getByRole("button", { name: "Inside" }));

    expect(onClose).not.toHaveBeenCalled();
  });
});
