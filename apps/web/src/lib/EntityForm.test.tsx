import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntityForm } from "./EntityForm";

describe("EntityForm", () => {
  it("renders fields, validates required, and submits typed values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <EntityForm
        open onOpenChange={() => {}}
        title="Create farm"
        fields={[
          { name: "name", label: "Farm name", required: true },
          { name: "location", label: "Location" },
        ]}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByText("Create farm")).toBeInTheDocument();

    // submit empty → blocked by required validation
    await user.click(screen.getByRole("button", { name: /save/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/required/i);

    await user.type(screen.getByLabelText(/Farm name/i), "Anaimalai Block A");
    await user.type(screen.getByLabelText(/Location/i), "Anaimalai");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ name: "Anaimalai Block A", location: "Anaimalai" });
  });

  it("coerces number fields to numbers", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <EntityForm
        open onOpenChange={() => {}}
        title="Add strain"
        fields={[{ name: "cycleDays", label: "Cycle days", type: "number", required: true }]}
        onSubmit={onSubmit}
      />,
    );
    await user.type(screen.getByLabelText(/Cycle days/i), "22");
    await user.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ cycleDays: 22 }));
  });
});
