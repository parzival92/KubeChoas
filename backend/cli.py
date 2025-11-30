#!/usr/bin/env python3
"""
KubeChaos CLI
Terminal interface for the KubeChaos incident simulator.
"""

import typer
import requests
import sys
import os
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.markdown import Markdown
from rich import print as rprint
from typing import Optional

# Configuration
API_URL = os.getenv("KUBECHAOS_API_URL", "http://localhost:8000")

app = typer.Typer(
    name="kubechaos",
    help="Terminal-driven Kubernetes incident simulator",
    add_completion=False,
)
console = Console()

def check_api():
    """Check if API is reachable"""
    try:
        response = requests.get(f"{API_URL}/health", timeout=2)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False

@app.command()
def list(
    difficulty: Optional[str] = typer.Option(None, help="Filter by difficulty (beginner, intermediate, advanced, expert)"),
):
    """List available chaos scenarios"""
    if not check_api():
        rprint(f"[bold red]Error:[/bold red] Cannot connect to KubeChaos API at {API_URL}. Is the backend running?")
        sys.exit(1)

    try:
        if difficulty:
            response = requests.get(f"{API_URL}/scenarios/difficulty/{difficulty}")
        else:
            response = requests.get(f"{API_URL}/scenarios")
        
        if response.status_code != 200:
            rprint(f"[bold red]Error:[/bold red] Failed to fetch scenarios: {response.text}")
            return

        scenarios = response.json()
        
        table = Table(title="KubeChaos Scenarios")
        table.add_column("ID", style="cyan", no_wrap=True)
        table.add_column("Name", style="magenta")
        table.add_column("Difficulty", style="green")
        table.add_column("Category", style="yellow")
        table.add_column("Time Limit", style="blue")

        for s in scenarios:
            table.add_row(
                s["id"],
                s["name"],
                s["difficulty"],
                s["category"],
                f"{s['time_limit_seconds']}s"
            )

        console.print(table)
        rprint("\n[bold]To start a scenario:[/bold] [green]python3 cli.py start <scenario_id>[/green]")

    except Exception as e:
        rprint(f"[bold red]Error:[/bold red] {str(e)}")

@app.command()
def start(scenario_id: str):
    """Start a specific game scenario"""
    if not check_api():
        rprint(f"[bold red]Error:[/bold red] Cannot connect to KubeChaos API at {API_URL}. Is the backend running?")
        sys.exit(1)

    try:
        # First get scenario details
        s_response = requests.get(f"{API_URL}/scenarios/{scenario_id}")
        if s_response.status_code != 200:
            rprint(f"[bold red]Error:[/bold red] Scenario not found: {scenario_id}")
            return
        
        scenario = s_response.json()
        
        # Start the scenario
        response = requests.post(f"{API_URL}/scenarios/{scenario_id}/start")
        
        if response.status_code == 200:
            rprint(Panel.fit(
                f"[bold green]Scenario Started: {scenario['name']}[/bold green]\n\n"
                f"[bold]Objective:[/bold] {scenario['description']}\n\n"
                f"[bold]Time Limit:[/bold] {scenario['time_limit_seconds']} seconds\n\n"
                f"[yellow]Good luck, Operator![/yellow]",
                title="KubeChaos",
                border_style="green"
            ))
            
            rprint("\n[bold]Learning Objectives:[/bold]")
            for obj in scenario["learning_objectives"]:
                rprint(f"  • {obj}")
                
            rprint("\n[bold]Useful Commands:[/bold]")
            rprint("  • Check status: [cyan]python3 cli.py status[/cyan]")
            rprint("  • Get hint:     [cyan]python3 cli.py hint[/cyan]")
            
        else:
            rprint(f"[bold red]Failed to start scenario:[/bold red] {response.json().get('detail', 'Unknown error')}")

    except Exception as e:
        rprint(f"[bold red]Error:[/bold red] {str(e)}")

@app.command()
def status():
    """Show current game status"""
    if not check_api():
        rprint(f"[bold red]Error:[/bold red] Cannot connect to KubeChaos API at {API_URL}. Is the backend running?")
        sys.exit(1)

    try:
        # Get game state
        response = requests.get(f"{API_URL}/status")
        state = response.json()
        
        # Get active experiments
        exp_response = requests.get(f"{API_URL}/chaos/experiments")
        experiments = exp_response.json().get("experiments", [])
        
        status_color = "green" if not experiments else "red"
        status_text = "Normal" if not experiments else "CHAOS ACTIVE"
        
        grid = Table.grid(expand=True)
        grid.add_column()
        grid.add_column(justify="right")
        grid.add_row(f"[bold]System Status:[/bold] [{status_color}]{status_text}[/{status_color}]", f"[dim]{state['currentTime']}[/dim]")
        
        console.print(Panel(grid, title="KubeChaos Status", border_style=status_color))
        
        if experiments:
            rprint("\n[bold red]Active Chaos Experiments:[/bold red]")
            for exp in experiments:
                rprint(f"  • [bold]{exp['name']}[/bold] ({exp['kind']})")
        else:
            rprint("\n[green]No active chaos experiments. Cluster is stable.[/green]")
            
        rprint(f"\n[bold]Score:[/bold] {state['score']['totalScore']}")
        rprint(f"[bold]Commands Used:[/bold] {state['score']['commandsUsed']}")

    except Exception as e:
        rprint(f"[bold red]Error:[/bold red] {str(e)}")

@app.command()
def hint():
    """Get a hint for the current scenario"""
    # Note: In a real implementation, we'd need to track the current active scenario in the backend state.
    # For now, we'll list hints for all active experiments or just generic advice if no scenario tracking.
    
    # This is a simplified implementation assuming the user knows which scenario they are running
    # or we fetch the active scenario from the backend (which might need a backend update to track 'current_scenario')
    
    # For this MVP, we'll just show generic help or ask user to specify scenario if we can't detect it.
    # However, let's try to be smart and look at active experiments.
    
    if not check_api():
        rprint(f"[bold red]Error:[/bold red] Cannot connect to KubeChaos API at {API_URL}. Is the backend running?")
        sys.exit(1)
        
    try:
        exp_response = requests.get(f"{API_URL}/chaos/experiments")
        experiments = exp_response.json().get("experiments", [])
        
        if not experiments:
            rprint("[yellow]No active chaos experiments found. Start a scenario first![/yellow]")
            return
            
        # Try to match experiment name to scenario
        # Experiment names are formatted as "game-{scenario_id}"
        for exp in experiments:
            name = exp['name']
            if name.startswith("game-"):
                scenario_id = name.replace("game-", "")
                
                # Fetch scenario hints
                s_response = requests.get(f"{API_URL}/scenarios/{scenario_id}")
                if s_response.status_code == 200:
                    scenario = s_response.json()
                    hints = scenario.get("hints", [])
                    
                    if hints:
                        rprint(Panel(
                            "\n".join([f"• {h}" for h in hints]),
                            title=f"Hints for {scenario['name']}",
                            border_style="yellow"
                        ))
                    else:
                        rprint("[yellow]No hints available for this scenario.[/yellow]")
                return

        rprint("[yellow]Could not determine active scenario from experiments.[/yellow]")

    except Exception as e:
        rprint(f"[bold red]Error:[/bold red] {str(e)}")

@app.command()
def stop():
    """Stop all chaos experiments"""
    if not check_api():
        rprint(f"[bold red]Error:[/bold red] Cannot connect to KubeChaos API at {API_URL}. Is the backend running?")
        sys.exit(1)

    try:
        # We need to list experiments and delete them
        exp_response = requests.get(f"{API_URL}/chaos/experiments")
        experiments = exp_response.json().get("experiments", [])
        
        if not experiments:
            rprint("[green]No active experiments to stop.[/green]")
            return
            
        for exp in experiments:
            # Delete experiment
            # We need to know the type (kind)
            kind = exp['kind']
            name = exp['name']
            namespace = exp['namespace']
            
            requests.delete(f"{API_URL}/chaos/experiments/{name}?namespace={namespace}&chaos_type={kind}")
            rprint(f"[green]Stopped experiment: {name}[/green]")
            
        rprint("\n[bold green]All chaos experiments stopped. Cluster should recover shortly.[/bold green]")

    except Exception as e:
        rprint(f"[bold red]Error:[/bold red] {str(e)}")

if __name__ == "__main__":
    app()
